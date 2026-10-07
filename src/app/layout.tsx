import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';
export const metadata:Metadata={title:{default:'PactSplit — One invoice. Every teammate paid.',template:'%s · PactSplit'},description:'One shared invoice for your freelance team. Split native USDC payments automatically on Arc.'};
const inter=Inter({subsets:['latin'],variable:'--font-inter'});
const manrope=Manrope({subsets:['latin'],variable:'--font-manrope'});
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en" data-scroll-behavior="smooth"><body className={`${inter.variable} ${manrope.variable}`}><Providers>{children}</Providers></body></html>;}
