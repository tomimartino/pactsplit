// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Immutable public invoices, settled with Arc's native 18-decimal USDC.
/// @dev No admin, upgrades, platform fee, deposits, or balance withdrawal function.
contract PactSplit is ReentrancyGuard {
    uint256 public constant MAX_RECIPIENTS = 5;
    uint256 public constant MAX_AMOUNT = 1_000_000 * 1e18;
    uint256 public constant AMOUNT_STEP = 1e16; // invoices are entered in USDC cents
    enum Status { Open, Paid, Cancelled }
    struct Recipient { address wallet; uint16 bps; string name; string role; }
    struct Invoice {
        address creator;
        uint256 amount;
        string title;
        Status status;
        uint64 createdAt;
        uint64 paidAt;
        address payer;
        uint64 paidBlock;
        Recipient[] recipients;
    }
    uint256 public invoiceCount;
    mapping(uint256 => Invoice) private invoices;
    mapping(address => uint256[]) private ownerInvoices;

    error InvalidAmount();
    error InvalidTitle();
    error InvalidRecipients();
    error InvalidRecipient();
    error DuplicateRecipient();
    error InvalidSplit();
    error InvoiceNotFound();
    error InvoiceClosed();
    error IncorrectPayment();
    error NotCreator();
    error TransferFailed(address recipient);
    error InvalidPagination();

    event InvoiceCreated(uint256 indexed id, address indexed creator, uint256 amount);
    event InvoicePaid(uint256 indexed id, address indexed payer, uint256 amount);
    event RecipientPaid(uint256 indexed id, address indexed recipient, uint256 amount);
    event InvoiceCancelled(uint256 indexed id);

    function createInvoice(string calldata title, uint256 amount, Recipient[] calldata recipients)
        external returns (uint256 id)
    {
        if (amount == 0 || amount > MAX_AMOUNT || amount % AMOUNT_STEP != 0) revert InvalidAmount();
        if (bytes(title).length == 0 || bytes(title).length > 120) revert InvalidTitle();
        uint256 length = recipients.length;
        if (length == 0 || length > MAX_RECIPIENTS) revert InvalidRecipients();
        uint256 totalBps;
        for (uint256 i; i < length; ++i) {
            Recipient calldata r = recipients[i];
            if (r.wallet == address(0) || r.wallet == address(this) || r.bps == 0 ||
                bytes(r.name).length == 0 || bytes(r.name).length > 40 || bytes(r.role).length > 40)
                revert InvalidRecipient();
            for (uint256 j; j < i; ++j)
                if (r.wallet == recipients[j].wallet) revert DuplicateRecipient();
            totalBps += r.bps;
        }
        if (totalBps != 10_000) revert InvalidSplit();
        id = ++invoiceCount;
        Invoice storage inv = invoices[id];
        inv.creator = msg.sender;
        inv.amount = amount;
        inv.title = title;
        inv.createdAt = uint64(block.timestamp);
        for (uint256 i; i < length; ++i) inv.recipients.push(recipients[i]);
        ownerInvoices[msg.sender].push(id);
        emit InvoiceCreated(id, msg.sender, amount);
    }

    function payInvoice(uint256 id) external payable nonReentrant {
        Invoice storage inv = _invoice(id);
        if (inv.status != Status.Open) revert InvoiceClosed();
        if (msg.value != inv.amount) revert IncorrectPayment();
        inv.status = Status.Paid;
        inv.payer = msg.sender;
        inv.paidAt = uint64(block.timestamp);
        inv.paidBlock = uint64(block.number);
        uint256 distributed;
        uint256 length = inv.recipients.length;
        for (uint256 i; i < length; ++i) {
            Recipient storage r = inv.recipients[i];
            // The final recipient receives any integer remainder. All input cents
            // and basis points are exactly divisible at native 18-decimal precision.
            uint256 share = i == length - 1 ? msg.value - distributed : msg.value * r.bps / 10_000;
            distributed += share;
            (bool ok,) = payable(r.wallet).call{value: share}("");
            if (!ok) revert TransferFailed(r.wallet);
            emit RecipientPaid(id, r.wallet, share);
        }
        emit InvoicePaid(id, msg.sender, msg.value);
    }

    function cancelInvoice(uint256 id) external nonReentrant {
        Invoice storage inv = _invoice(id);
        if (inv.creator != msg.sender) revert NotCreator();
        if (inv.status != Status.Open) revert InvoiceClosed();
        inv.status = Status.Cancelled;
        emit InvoiceCancelled(id);
    }

    function getInvoice(uint256 id) external view returns (Invoice memory) { return _invoice(id); }

    /// @notice Bounded pagination avoids an unbounded return as an owner's history grows.
    function getOwnerInvoices(address owner, uint256 offset, uint256 limit)
        external view returns (uint256[] memory ids, uint256 total)
    {
        if (limit == 0 || limit > 50) revert InvalidPagination();
        uint256[] storage all = ownerInvoices[owner];
        total = all.length;
        if (offset >= total) return (new uint256[](0), total);
        uint256 length = total - offset < limit ? total - offset : limit;
        ids = new uint256[](length);
        for (uint256 i; i < length; ++i) ids[i] = all[total - 1 - offset - i];
    }

    function _invoice(uint256 id) private view returns (Invoice storage inv) {
        if (id == 0 || id > invoiceCount) revert InvoiceNotFound();
        inv = invoices[id];
    }
}
