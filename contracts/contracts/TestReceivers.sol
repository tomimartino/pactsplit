// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IPactSplit { function payInvoice(uint256 id) external payable; }
contract RejectingReceiver { receive() external payable { revert("Cannot receive"); } }
contract ReenteringReceiver {
    IPactSplit public target;
    uint256 public invoiceId;
    bool public attempted;
    bool public succeeded;
    function configure(address target_, uint256 id_) external { target = IPactSplit(target_); invoiceId = id_; }
    receive() external payable {
        attempted = true;
        (succeeded,) = address(target).call{value: msg.value}(abi.encodeCall(IPactSplit.payInvoice, (invoiceId)));
    }
}
