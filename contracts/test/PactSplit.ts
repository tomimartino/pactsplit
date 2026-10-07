import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { zeroAddress, parseEther } from "viem";

describe("PactSplit invoice settlement", async () => {
  const { viem } = await network.create();
  const client = await viem.getPublicClient();
  const [creator, clientWallet, a, b, c, outsider] =
    await viem.getWalletClients();
  const amount = parseEther("10");
  const recipients = [
    { wallet: a.account.address, bps: 6000, name: "Alya", role: "Developer" },
    { wallet: b.account.address, bps: 3000, name: "Rafi", role: "Designer" },
    { wallet: c.account.address, bps: 1000, name: "Nia", role: "Writer" },
  ];
  async function fresh() {
    return viem.deployContract("PactSplit");
  }
  async function open() {
    const p = await fresh();
    await p.write.createInvoice(["Team project", amount, recipients]);
    return p;
  }
  it("pays 60/30/10 directly and records one atomic receipt", async () => {
    const p = await open();
    const before = await Promise.all(
      recipients.map((r) => client.getBalance({ address: r.wallet })),
    );
    const hash = await p.write.payInvoice([1n], {
      value: amount,
      account: clientWallet.account,
    });
    const receipt = await client.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, "success");
    const after = await Promise.all(
      recipients.map((r) => client.getBalance({ address: r.wallet })),
    );
    assert.deepEqual(
      after.map((n, i) => n - before[i]),
      [parseEther("6"), parseEther("3"), parseEther("1")],
    );
    assert.equal(await client.getBalance({ address: p.address }), 0n);
    const inv = await p.read.getInvoice([1n]);
    assert.equal(inv.status, 1);
    assert.equal(
      inv.payer.toLowerCase(),
      clientWallet.account.address.toLowerCase(),
    );
    assert.equal(inv.paidBlock, receipt.blockNumber);
    const logs = await client.getContractEvents({
      address: p.address,
      abi: p.abi,
      eventName: "RecipientPaid",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
      strict: true,
    });
    assert.equal(logs.length, 3);
    assert.equal(
      logs.reduce((sum, l) => sum + l.args.amount, 0n),
      amount,
    );
  });
  it("prevents a second payment", async () => {
    const p = await open();
    await p.write.payInvoice([1n], { value: amount });
    await assert.rejects(
      p.write.payInvoice([1n], { value: amount }),
      /InvoiceClosed/,
    );
  });
  it("requires exact value and leaves unpaid state intact", async () => {
    const p = await open();
    for (const value of [0n, amount - 1n, amount + 1n])
      await assert.rejects(
        p.write.payInvoice([1n], { value }),
        /IncorrectPayment/,
      );
    assert.equal((await p.read.getInvoice([1n])).status, 0);
  });
  it("rejects unknown invoices", async () => {
    const p = await fresh();
    await assert.rejects(p.read.getInvoice([0n]), /InvoiceNotFound/);
    await assert.rejects(
      p.write.payInvoice([1n], { value: amount }),
      /InvoiceNotFound/,
    );
  });
  it("only creator can cancel; closed invoices cannot be paid or cancelled again", async () => {
    const p = await open();
    await assert.rejects(
      p.write.cancelInvoice([1n], { account: outsider.account }),
      /NotCreator/,
    );
    await p.write.cancelInvoice([1n]);
    assert.equal((await p.read.getInvoice([1n])).status, 2);
    await assert.rejects(
      p.write.payInvoice([1n], { value: amount }),
      /InvoiceClosed/,
    );
    await assert.rejects(p.write.cancelInvoice([1n]), /InvoiceClosed/);
  });
  it("cannot cancel a paid invoice", async () => {
    const p = await open();
    await p.write.payInvoice([1n], { value: amount });
    await assert.rejects(p.write.cancelInvoice([1n]), /InvoiceClosed/);
  });
  it("rejects zero, oversized, and fractional-cent totals", async () => {
    const p = await fresh();
    for (const v of [0n, 1n, parseEther("1000000.01")])
      await assert.rejects(
        p.write.createInvoice(["Project", v, recipients]),
        /InvalidAmount/,
      );
  });
  it("rejects empty and oversized public metadata", async () => {
    const p = await fresh();
    for (const title of ["", "a".repeat(121)])
      await assert.rejects(
        p.write.createInvoice([title, amount, recipients]),
        /InvalidTitle/,
      );
    for (const name of ["", "a".repeat(41)])
      await assert.rejects(
        p.write.createInvoice([
          "Project",
          amount,
          [{ ...recipients[0], bps: 10000, name }],
        ]),
        /InvalidRecipient/,
      );
    await assert.rejects(
      p.write.createInvoice([
        "Project",
        amount,
        [{ ...recipients[0], bps: 10000, role: "a".repeat(41) }],
      ]),
      /InvalidRecipient/,
    );
  });
  it("rejects zero, self, and duplicate recipient wallets", async () => {
    const p = await fresh();
    for (const wallet of [zeroAddress, p.address])
      await assert.rejects(
        p.write.createInvoice([
          "Project",
          amount,
          [{ ...recipients[0], wallet, bps: 10000 }],
        ]),
        /InvalidRecipient/,
      );
    await assert.rejects(
      p.write.createInvoice([
        "Project",
        amount,
        [
          { ...recipients[0], bps: 5000 },
          { ...recipients[0], bps: 5000 },
        ],
      ]),
      /DuplicateRecipient/,
    );
  });
  it("requires 1–5 recipients with positive shares totaling 100%", async () => {
    const p = await fresh();
    await assert.rejects(
      p.write.createInvoice(["Project", amount, []]),
      /InvalidRecipients/,
    );
    await assert.rejects(
      p.write.createInvoice(["Project", amount, Array(6).fill(recipients[0])]),
      /InvalidRecipients/,
    );
    await assert.rejects(
      p.write.createInvoice([
        "Project",
        amount,
        [{ ...recipients[0], bps: 0 }],
      ]),
      /InvalidRecipient/,
    );
    await assert.rejects(
      p.write.createInvoice([
        "Project",
        amount,
        [{ ...recipients[0], bps: 9999 }],
      ]),
      /InvalidSplit/,
    );
  });
  it("reverts every allocation if a later recipient rejects payment", async () => {
    const p = await fresh();
    const reject = await viem.deployContract("RejectingReceiver");
    await p.write.createInvoice([
      "Atomic project",
      amount,
      [
        { ...recipients[0], bps: 5000 },
        { ...recipients[1], wallet: reject.address, bps: 5000 },
      ],
    ]);
    const before = await client.getBalance({ address: a.account.address });
    const nonceBefore = await client.getTransactionCount({
      address: clientWallet.account.address,
    });
    await assert.rejects(
      p.write.payInvoice([1n], {
        value: amount,
        account: clientWallet.account,
        gas: 1_000_000n,
      }),
      /TransferFailed/,
    );
    assert.equal(
      await client.getBalance({ address: a.account.address }),
      before,
    );
    assert.equal(await client.getBalance({ address: reject.address }), 0n);
    assert.equal(await client.getBalance({ address: p.address }), 0n);
    assert.equal((await p.read.getInvoice([1n])).status, 0);
    assert.equal(
      await client.getTransactionCount({
        address: clientWallet.account.address,
      }),
      nonceBefore + 1,
    );
  });
  it("blocks reentrancy while a recipient can still receive their share", async () => {
    const p = await fresh();
    const receiver = await viem.deployContract("ReenteringReceiver");
    await p.write.createInvoice([
      "Reentrancy check",
      amount,
      [
        {
          wallet: receiver.address,
          bps: 10000,
          name: "Receiver",
          role: "Test",
        },
      ],
    ]);
    await receiver.write.configure([p.address, 1n]);
    await p.write.payInvoice([1n], { value: amount });
    assert.equal(await receiver.read.attempted(), true);
    assert.equal(await receiver.read.succeeded(), false);
    assert.equal(
      await client.getBalance({ address: receiver.address }),
      amount,
    );
    assert.equal((await p.read.getInvoice([1n])).status, 1);
  });
  it("conserves native USDC across varied exact cent totals and percentage splits", async () => {
    const p = await fresh();
    for (let i = 1; i <= 25; i++) {
      const v = BigInt(i) * 10n ** 16n;
      const split = 123 + i * 71;
      const rs = [
        { ...recipients[0], bps: split },
        { ...recipients[1], bps: 10000 - split },
      ];
      await p.write.createInvoice(["Conservation", v, rs]);
      const before = await Promise.all(
        rs.map((r) => client.getBalance({ address: r.wallet })),
      );
      await p.write.payInvoice([BigInt(i)], {
        value: v,
        account: clientWallet.account,
      });
      const after = await Promise.all(
        rs.map((r) => client.getBalance({ address: r.wallet })),
      );
      assert.equal(after[0] - before[0], (v * BigInt(split)) / 10000n);
      assert.equal(after[1] - before[1], v - (v * BigInt(split)) / 10000n);
      assert.equal(
        after.reduce((s, n, j) => s + n - before[j], 0n),
        v,
      );
      assert.equal(await client.getBalance({ address: p.address }), 0n);
    }
  });
  it("returns owner invoices newest first with bounded pagination", async () => {
    const p = await fresh();
    for (let i = 0; i < 4; i++)
      await p.write.createInvoice(["Project", amount, recipients]);
    const [ids, total] = await p.read.getOwnerInvoices([
      creator.account.address,
      1n,
      2n,
    ]);
    assert.deepEqual(ids, [3n, 2n]);
    assert.equal(total, 4n);
    assert.deepEqual(
      (await p.read.getOwnerInvoices([outsider.account.address, 0n, 2n]))[0],
      [],
    );
    await assert.rejects(
      p.read.getOwnerInvoices([creator.account.address, 0n, 51n]),
      /InvalidPagination/,
    );
  });
});
