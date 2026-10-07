'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark, Icon, Arrow } from './icons';
import { WalletButton } from './wallet-button';
import { chain,isMainnet,contractAddress } from '@/lib/network';
export function Header() {return <header className="site-header"><Link href="/" className="brand"><LogoMark/>PactSplit</Link><nav aria-label="Main navigation"><Link href="/#how-it-works">How it works</Link><Link href="/demo">Try the demo</Link><Link href="/invoices">Your invoices <Arrow/></Link></nav></header>;}
export function AppShell({children}:{children:React.ReactNode}) {
  const pathname=usePathname();
  return <div className="app-shell"><aside className="sidebar"><Link href="/" className="brand"><LogoMark/>PactSplit</Link><div className="workspace-label">YOUR WORKSPACE</div><nav aria-label="Workspace"><Link href="/invoices" className={pathname==='/invoices'?'active':''}><Icon name="grid"/>Overview</Link><Link href="/invoices/new" className={pathname==='/invoices/new'?'active':''}><Icon name="invoice"/>Create invoice</Link><Link href="/demo" className={pathname==='/demo'?'active':''}><Icon name="wallet"/>Explore demo</Link><Link href="/setup" className={pathname==='/setup'?'active':''}><Icon name="settings"/>Network setup</Link></nav><div className="sidebar-bottom"><span className="network-badge"><span className="live-dot"/>{chain.name}</span><p>One invoice.<br/>Every teammate paid.</p><Link href="/">Back to home <Arrow/></Link></div></aside><div className="app-content"><header className="app-header"><span>Workspace <span className="breadcrumb">/ {pathname.includes('new')?'New invoice':pathname.includes('setup')?'Setup':pathname.includes('demo')?'Demo':'Overview'}</span></span><WalletButton/></header>{!isMainnet?<div className="network-notice"><span>{chain.id===31337?'Local test environment':'Arc testnet'}</span> · Payments use test funds with no real value.</div>:null}{!contractAddress?<div className="config-notice">Wallet transactions will be available after contract setup. You can create a draft or explore the demo now.</div>:null}<main className="workspace-main">{children}</main></div></div>;
}
