'use client';
import { useEffect, useState } from 'react';
import { type Hash, type TransactionReceipt } from 'viem';
import { publicClient, chain, contractAddress } from './network';
import { friendlyError } from './errors';
export function useTransaction(scope:string,onConfirmed:(receipt:TransactionReceipt)=>Promise<void>|void) {
  const key=`pactsplit:pending:v1:${chain.id}:${contractAddress}:${scope}`;
  const [hash,setHash]=useState<Hash>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    try { const saved=localStorage.getItem(key);setHash(saved && /^0x[0-9a-f]{64}$/i.test(saved)?saved as Hash:undefined); } catch {setError('Browser storage is unavailable. Keep the transaction link until confirmation.');}
  },[key]);
  async function check(txHash:Hash) {
    const receipt=await publicClient.waitForTransactionReceipt({hash:txHash,timeout:30000});
    if(receipt.status!=='success') {try{localStorage.removeItem(key);}catch{}setHash(undefined);throw new Error('The transaction reverted. No invoice payment was distributed. A network fee may still apply.');}
    await onConfirmed(receipt);
    try{localStorage.removeItem(key);}catch{}
    setHash(undefined);
  }
  async function run(send:()=>Promise<Hash>) {
    if(busy||hash) return;
    setBusy(true);setError('');
    try { const txHash=await send();setHash(txHash);try{localStorage.setItem(key,txHash);}catch{}await check(txHash); }
    catch(e) {setError(friendlyError(e));}
    finally {setBusy(false);}
  }
  async function resume() {if(!hash||busy)return;setBusy(true);setError('');try{await check(hash);}catch(e){setError(friendlyError(e));}finally{setBusy(false);}}
  return {hash,busy,error,setError,run,resume};
}
