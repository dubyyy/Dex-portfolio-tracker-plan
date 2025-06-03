'use client'
import { Geist, Geist_Mono } from "next/font/google";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const queryClient = new QueryClient()




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full bg-[#0a0d12]`}
      >
    <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}> 
               
            {children}
              
          </QueryClientProvider> 
    </WagmiProvider>
        
      </body>
    </html>
  );
}
