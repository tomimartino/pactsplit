'use client';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { chain, isLocal } from '@/lib/network';
import { shortAddress } from '@/lib/amounts';
import { selectLocalAccount } from '@/lib/local-wallet';
import { friendlyError } from '@/lib/errors';
import { useState } from 'react';
export function WalletButton() {
  const account = useAccount();
  const {connectAsync,connectors,isPending} = useConnect();
  const {disconnect} = useDisconnect();
  const {switchChainAsync} = useSwitchChain();
  const [error,setError] = useState('');
  async function connect(local=false) {
    setError('');
    const connector = connectors.find(c=>local?c.id==='pactsplit-local':c.id!=='pactsplit-local');
    if (!connector) {setError('Install a browser wallet such as MetaMask, then reload this page.');return;}
    try {await connectAsync({connector});} catch(e) {setError(friendlyError(e));}
  }
  return <div className="wallet-control">
    {account.isConnected ? <><span className="wallet-address"><span className="live-dot"/>{shortAddress(account.address!)}</span>{account.chainId!==chain.id?<button className="btn btn-small" onClick={async()=>{try{await switchChainAsync({chainId:chain.id});setError('');}catch(e){setError(friendlyError(e));}}}>Switch to {chain.name}</button>:null}<button className="btn btn-small btn-ghost" onClick={()=>disconnect()}>Disconnect</button>{isLocal && account.connector?.id==='pactsplit-local'?<select aria-label="Local test account" onChange={e=>void selectLocalAccount(Number(e.target.value))} defaultValue="0"><option value="0">Creator wallet</option><option value="4">Client wallet</option></select>:null}</> : <><button className="btn btn-small" disabled={isPending} onClick={()=>void connect()}>{isPending?'Connecting…':'Connect wallet'}</button>{isLocal?<button className="btn btn-small btn-ghost" onClick={()=>void connect(true)}>Use local test wallet</button>:null}</>}
    {error?<span className="wallet-error" role="alert">{error}</span>:null}
  </div>;
}
