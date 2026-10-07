"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";
import {
  chain,
  contractAddress,
  deploymentBlock,
  publicClient,
  explorerAddress,
  isMainnet,
} from "@/lib/network";
import { Check, Arrow } from "@/components/icons";
import { friendlyError } from "@/lib/errors";
import type { Abi, Address, Hash } from "viem";
import { isAddress } from "viem";
import { formatMoney } from "@/lib/amounts";
import { TransactionStatus } from "@/components/transaction-status";
import { useTransaction } from "@/lib/transactions";
export default function Setup() {
  const { address, chainId: walletChainId } = useAccount();
  const { data: wallet } = useWalletClient();
  const [deployment, setDeployment] = useState<{
    address: Address;
    block: bigint;
    hash: Hash;
  }>();
  const deploymentKey = `pactsplit:deployment:v1:${chain.id}:${address?.toLowerCase() || "guest"}`;
  const balance = useQuery({
    queryKey: ["setup-balance", chain.id, address],
    enabled: !!address,
    queryFn: () => publicClient.getBalance({ address: address! }),
  });
  useEffect(() => {
    setDeployment(undefined);
    try {
      const saved = JSON.parse(localStorage.getItem(deploymentKey) || "null");
      if (
        saved &&
        isAddress(saved.address) &&
        /^\d+$/.test(saved.block) &&
        /^0x[0-9a-f]{64}$/i.test(saved.hash)
      ) {
        setDeployment({ ...saved, block: BigInt(saved.block) });
      }
    } catch {}
  }, [deploymentKey]);
  const tx = useTransaction(`deploy:${address || "guest"}`, (receipt) => {
    if (!receipt.contractAddress)
      throw new Error("No deployed contract address was returned.");
    setDeployment({
      address: receipt.contractAddress,
      block: receipt.blockNumber,
      hash: receipt.transactionHash,
    });
    try {
      localStorage.setItem(
        deploymentKey,
        JSON.stringify({
          address: receipt.contractAddress,
          block: String(receipt.blockNumber),
          hash: receipt.transactionHash,
        }),
      );
    } catch {}
  });
  async function deploy() {
    if (!wallet || !address) {
      tx.setError("Connect a browser wallet to deploy the contract.");
      return;
    }
    await tx.run(async () => {
      if ((await wallet.getChainId()) !== chain.id)
        throw new Error(`Switch your wallet to ${chain.name} first.`);
      const res = await fetch("/deployment-artifact.json");
      if (!res.ok)
        throw new Error("The deployment artifact could not be loaded.");
      const artifact = (await res.json()) as {
        abi: Abi;
        bytecode: `0x${string}`;
      };
      await publicClient.estimateGas({
        account: address,
        data: artifact.bytecode,
      });
      return wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        account: address,
      });
    });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">READY FOR YOUR FIRST PACT</span>
          <h1>Network & setup</h1>
          <p>A simple, transparent home for your team’s payments.</p>
        </div>
        <span className="pill">{chain.name}</span>
      </div>
      <ol className="setup-steps">
        <li>
          <span className="number-circle">1</span>
          <div>
            <strong>Connect your wallet</strong>
            <p>
              Click Connect wallet above, then switch to {chain.name} if
              prompted.
            </p>
          </div>
        </li>
        <li>
          <span className="number-circle">2</span>
          <div>
            <strong>
              {isMainnet ? "Check your USDC balance" : "Get free test USDC"}
            </strong>
            <p>
              {isMainnet
                ? "Real USDC covers payments and network fees. Review each transaction in your wallet."
                : chain.id === 31337
                  ? "The local test wallets are already funded."
                  : "Open the faucet below. Choose Arc Testnet and paste your wallet address."}
            </p>
          </div>
        </li>
        <li>
          <span className="number-circle">3</span>
          <div>
            <strong>
              {contractAddress
                ? "Create your first invoice"
                : "Deploy and get your details"}
            </strong>
            <p>
              {contractAddress
                ? "The invoice contract is ready. Add your team and their shares, then publish from your wallet."
                : "Click Deploy below and confirm in your wallet. Your contract address and deployment block appear automatically."}
            </p>
            {contractAddress ? (
              <a className="text-link" href="/invoices/new">
                Create invoice <Arrow />
              </a>
            ) : null}
          </div>
        </li>
      </ol>
      <div className="setup-layout">
        <section className="panel">
          <h2>Your current network</h2>
          <dl className="setup-details">
            <div>
              <dt>Network</dt>
              <dd>{chain.name}</dd>
            </div>
            <div>
              <dt>Chain ID</dt>
              <dd>{chain.id}</dd>
            </div>
            <div>
              <dt>Payment currency</dt>
              <dd>Native USDC · 18 decimals</dd>
            </div>
            <div>
              <dt>Invoice contract</dt>
              <dd>
                {contractAddress ? (
                  <a
                    href={explorerAddress(contractAddress)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contractAddress}
                  </a>
                ) : (
                  "Deployment pending"
                )}
              </dd>
            </div>
            {contractAddress ? (
              <div>
                <dt>Deployment block</dt>
                <dd>{String(deploymentBlock)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Wallet balance</dt>
              <dd>
                {address
                  ? balance.data !== undefined
                    ? `${formatMoney(balance.data)} ${isMainnet ? "USDC" : "test USDC"}`
                    : balance.error
                      ? "Could not load balance"
                      : "Loading…"
                  : "Connect wallet first"}
              </dd>
            </div>
          </dl>
          {address ? (
            <button
              className="text-button"
              disabled={balance.isFetching}
              onClick={() => void balance.refetch()}
            >
              {balance.isFetching
                ? "Refreshing balance…"
                : "Refresh wallet balance"}
            </button>
          ) : null}
          <div className="info-box">
            {isMainnet
              ? "This network uses real USDC for invoice payments and network fees."
              : "This environment uses test funds with no real value. Get test USDC from the official Arc/Circle faucet."}
          </div>
          {!isMainnet && chain.id !== 31337 ? (
            <a
              className="btn btn-ghost"
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
            >
              Get free test USDC <Arrow direction="up" />
            </a>
          ) : null}
          <a
            className="text-link"
            href="https://docs.arc.io/arc/references/connect-to-arc"
            target="_blank"
            rel="noreferrer"
          >
            Arc network documentation <Arrow direction="up" />
          </a>
        </section>
        <section className="panel">
          <h2>Free from the first invoice.</h2>
          <div className="free-stack">
            <div>
              <Check />
              <span>
                <strong>Vercel Hobby</strong>
                <small>Personal hackathon website · free subdomain</small>
              </span>
            </div>
            <div>
              <Check />
              <span>
                <strong>Open source tools</strong>
                <small>Next.js, wagmi, viem, Solidity, Hardhat</small>
              </span>
            </div>
            <div>
              <Check />
              <span>
                <strong>Your existing wallet</strong>
                <small>No paid wallet service or sign-in subscription</small>
              </span>
            </div>
            <div>
              <Check />
              <span>
                <strong>No database subscription</strong>
                <small>
                  Public invoices on Arc · private drafts in your browser
                </small>
              </span>
            </div>
          </div>
          <p className="field-help">
            PactSplit charges no platform fee. Arc mainnet network fees require
            real USDC. Testnet funds are free.
          </p>
        </section>
      </div>
      <section className="panel deploy-panel">
        <span className="eyebrow">BUILDER SETUP</span>
        <h2>Deploy the invoice contract</h2>
        <p>
          Deploy one immutable PactSplit contract to {chain.name}, then add its
          public address and deployment block to your hosting settings. Your
          wallet signs the deployment; no private key is requested or stored by
          this website.
        </p>
        {contractAddress ? (
          <div className="info-box">
            A contract is already configured. Deploy another only when you
            intend to start a new version.
          </div>
        ) : null}
        <TransactionStatus tx={tx} />
        {!address ? (
          <p className="field-help">
            Connect your wallet at the top of this page to continue.
          </p>
        ) : walletChainId !== chain.id ? (
          <p className="field-help">
            Use the Switch to {chain.name} button at the top of this page.
          </p>
        ) : balance.data === 0n ? (
          <p className="field-help">
            Your wallet needs {isMainnet ? "USDC" : "test USDC"} for the network
            fee.{" "}
            {isMainnet
              ? "Fund it before deploying."
              : "Use the free faucet, then refresh your balance."}
          </p>
        ) : null}
        <button
          className="btn"
          disabled={
            !address ||
            walletChainId !== chain.id ||
            tx.busy ||
            !!tx.hash ||
            !!deployment
          }
          onClick={() => void deploy()}
        >
          {tx.busy ? "Deploying…" : `Deploy on ${chain.name}`}
          <Arrow />
        </button>
        {deployment ? (
          <div className="deployment-result" role="status">
            <h3>Contract deployment confirmed</h3>
            <p>
              Your wallet created these values automatically. The address
              identifies your contract; the block is the network record
              containing its deployment.
            </p>
            <pre>{`NEXT_PUBLIC_PACTSPLIT_CHAIN_ID=${chain.id}\nNEXT_PUBLIC_PACTSPLIT_ADDRESS=${deployment.address}\nNEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK=${deployment.block}`}</pre>
            <button
              className="btn btn-small btn-ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `Contract address: ${deployment.address}\nDeployment block: ${deployment.block}`,
                  );
                } catch {
                  tx.setError(
                    "Select and copy the two values in the box above.",
                  );
                }
              }}
            >
              Copy contract address & block
            </button>
            <p>
              Copy these public values into Vercel’s project environment
              settings and redeploy. For a local app, put them in .env.local and
              restart.
            </p>
            <p>
              Next: verify the contract source on the Arc explorer, then create
              and pay a small test invoice using two wallets.
            </p>
          </div>
        ) : null}
        {tx.error ? (
          <span className="sr-only">{friendlyError(tx.error)}</span>
        ) : null}
      </section>
    </>
  );
}
