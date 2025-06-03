'use client';

import React, { useState, useEffect } from 'react';
import { House } from 'lucide-react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import Image from 'next/image';

// Define the Token interface
interface Token {
  name: string;
  symbol: string;
  balance: number;
  img?: string;
  price?: number; // Price might not always be available
}

const Dashboard: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  

  useEffect(() => {
    const fetchTokens = async (walletAddress: string) => {
      if (!walletAddress) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/tokens', { address: walletAddress });
        // Ensure the response structure is as expected: { tokens: [...] }
        if (response.data && Array.isArray(response.data.tokens)) {
          setTokens(response.data.tokens);
        } else {
          console.warn('API response did not contain a valid tokens array:', response.data);
          setTokens([]); // Set to empty array if data.tokens is not as expected
        }
      } catch (e) {
        console.error("Failed to fetch tokens:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        if (axios.isAxiosError(e) && e.response) {
            setError(e.response.data.error || errorMessage);
        } else {
            setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchTokens(address);
    }
  }, [address]); // Re-fetch if address changes

  return (
    <div className="bg-white/0 rounded-xl border border-[#23272b] p-6 max-w-4xl mx-auto mt-10 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-[#23272b] rounded-lg p-2 mr-4">
          <House />
        </div>
        <h1 className="text-[14px] lg:text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Portfolio Chart Section */}
      <div>
        <h2 className="text-[14px] lg:text-xl font-semibold mb-4">Portfolio Chart</h2>
        <div className="font-lighter text-[10px] grid grid-cols-4 gap-4 text-gray-300 lg:text-lg font-medium border-b border-[#23272b] pb-2">
          <div>Name</div>
          <div>Symbol</div>
          <div>Balance</div>
          <div>Price</div> {/* Changed from 24-Hour Price Change */}
        </div>

        {/* Token Data Rows */}
        {isLoading && <div className="text-center py-4">Loading tokens...</div>}
        {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}
        {!isLoading && !error && tokens.length === 0 && <div className="text-center py-4">No tokens found for this address.</div>}
        {!isLoading && !error && tokens.map((token, index) => (
          <div key={index} className="font-lighter text-[10px] grid grid-cols-4 gap-4 text-gray-100 lg:text-lg items-center border-b border-[#23272b] py-3 hover:bg-white/5 transition-colors duration-150">
            <div className="flex items-center">
              {token.img && <Image src={token.img} alt={token.name} width={24} height={24} className="mr-2 rounded-full" />}
              <span>{token.name}</span>
            </div>
            <div>{token.symbol}</div>
            <div>{token.balance.toFixed(4)}</div>
            <div>{token.price !== undefined ? `$${token.price.toFixed(2)}` : 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
