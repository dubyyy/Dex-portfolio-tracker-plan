'use client'

import { useAccount, useBalance } from 'wagmi'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDisconnect } from 'wagmi'
import Chart from './chart'
import '../globals.css'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'



 function TokenCount() {
    const { address } = useAccount()
    useEffect(()=>{
        if(address){
            axios.post('/api/tokens',{address})
            .then((res)=>{
                console.log(res.data)
            })
            .catch((err)=>{
                console.log(err)
            })
        }
    },[address])
}



export function WalletData() {
  // --- Show number of tokens held using Alchemy ---
  // Place this above Top Holdings
  // <TokenCountAlchemy /> will be rendered (see below)

  const { address } = useAccount()
  const { isLoading, error } = useBalance({ address })

  const [topHoldings, setTopHoldings] = useState<{ name: string, balance: number }[]>([])
  const [stableCoins, setStableCoins] = useState<{ name: string, balance: number }[]>([])
  const [tokenPrices, setTokenPrices] = useState<{ [token: string]: number }>({});
  const [stablePrices, setStablePrices] = useState<{ [token: string]: number }>({});

  // Map token name to CoinGecko ID (extend as needed)
  const tokenNameToId: { [key: string]: string } = {
    'Ethereum': 'ethereum',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    // Add more tokens as needed
  };

  // Fetch price for a token from CoinGecko
  const fetchTokenPrice = async (id: string) => {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
      const data = await res.json();
      return data[id]?.usd || 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    if (!address) return

    const fetchTopHoldings = async () => {
      try {
        const response = await axios.post('/api/block-number', { address })
        setTopHoldings(response.data.topThree || [])
      } catch (error) {
        console.error('Error fetching top holdings:', error)
      }
    }

    const fetchStableCoins = async () => {
      try {
        const response = await axios.post('/api/stable-coins', { address })
        setStableCoins(response.data.stableCoins || [])
      } catch (error) {
        console.error('Error fetching stable coins:', error)
      }
    }

    fetchTopHoldings()
    fetchStableCoins()
  }, [address])

  // Fetch USD prices for topHoldings
  useEffect(() => {
    const fetchPrices = async () => {
      const prices: { [token: string]: number } = {};
      for (const token of topHoldings) {
        const id = tokenNameToId[token.name] || 'ethereum'; // default to ethereum
        prices[token.name] = await fetchTokenPrice(id);
      }
      setTokenPrices(prices);
    };
    if (topHoldings.length > 0) fetchPrices();
  }, [topHoldings, tokenNameToId]);

  // Fetch USD prices for stableCoins
  useEffect(() => {
    const fetchPrices = async () => {
      const prices: { [token: string]: number } = {};
      for (const token of stableCoins) {
        const id = tokenNameToId[token.name] || 'ethereum'; // default to ethereum
        prices[token.name] = await fetchTokenPrice(id);
      }
      setStablePrices(prices);
    };
    if (stableCoins.length > 0) fetchPrices();
  }, [stableCoins, tokenNameToId]);

  if (!address) return <div className='h-full w-full flex items-center justify-center'>No wallet connected.</div>
  if (isLoading) return <div className='h-full w-full flex items-center justify-center'>Loading balance...</div>
  if (error) return <div className='h-full w-full flex items-center justify-center'>Error fetching balance</div>

  return (
    <NavigationMenu viewport={false} className="mt-6">
      <NavigationMenuList>
        <span className="mb-3 text-start w-[300px] font-semibold text-xsm flex items-center justify-center">Portfolio Breadown</span>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-black/0 hover:!bg-zinc-800 hover:!text-white">
            Top Holdings
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              {topHoldings.length > 0 ? (
                topHoldings.map((token, i) => {
                  const usd = tokenPrices[token.name] ? token.balance * tokenPrices[token.name] : 0;
                  return (
                    <ListItem key={i} href="#" title={token.name}>
                      Balance: {token.balance.toFixed(4)}<br />
                      <span className="text-green-400">USD: ${usd.toFixed(2)}</span>
                    </ListItem>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">No tokens</div>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-black/0 hover:!bg-zinc-800 hover:!text-white">
            Stable Coins
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              {stableCoins.length > 0 ? (
                stableCoins.map((token, i) => {
                  const usd = stablePrices[token.name] ? token.balance * stablePrices[token.name] : 0;
                  return (
                    <ListItem key={i} href="#" title={token.name}>
                      Balance: {token.balance.toFixed(4)}<br />
                      <span className="text-green-400">USD: ${usd.toFixed(2)}</span>
                    </ListItem>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">No stablecoins</div>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export function ChartComponent() {
  const { address } = useAccount()
  const { isLoading, error } = useBalance({ address })

  if (!address) return <div>No wallet connected.</div>
  if (isLoading) return <div>Loading balance...</div>
  if (error) return <div>Error fetching balance</div>

  return <Chart />
}



export function BalanceComponent() {
  const { address } = useAccount();
  const { data, isLoading, error } = useBalance({ address, chainId: 300 });
  const [usdPrice, setUsdPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUsdPrice() {
      // Fetch ETH price in USD from CoinGecko
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const priceData = await res.json();
      setUsdPrice(priceData.ethereum.usd);
    }
    if (data?.symbol === "ETH") {
      fetchUsdPrice();
    }
    // For other tokens, you would adjust the API call accordingly
  }, [data?.symbol]);

  if (!address) return <div>No wallet connected.</div>;
  if (isLoading) return <div>Loading balance...</div>;
  if (error) return <div>Error fetching balance</div>;

  const balance = Number(data?.formatted || 0);
  const usdValue =
    usdPrice !== null ? (balance * usdPrice).toLocaleString("en-US", { style: "currency", currency: "USD" }) : null;

  return (
    <div>
      
      {usdValue && (
        <p className='lg:text-[15px] text-[8px] '>
          {usdValue} ({data?.formatted} {data?.symbol})
        </p>
      )}
      
    </div>
  );
}

export const ShortAddress = () => {
  const { address } = useAccount()
  const short = address?.slice(0, 9)
  return <div>{short}</div>
}


// --- Component: TokenCountAlchemy ---
// Fetches and displays the number of unique tokens in the connected wallet using Alchemy
export function TokenCountAlchemy() {
  const { address } = useAccount();
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const { isLoading, error } = useBalance({ address });

  interface AlchemyTokenBalance {
    tokenBalance: string;
  }

  useEffect(() => {
    if (!address) return;
    const fetchTokenCount = async () => {
      setLoading(true);
      setFailed(null);
      try {
        // Use your Alchemy API key from .env
        const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
        if (!apiKey) throw new Error('Alchemy API key missing');
        // Use Ethereum Mainnet (change if needed)
        const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'alchemy_getTokenBalances',
            params: [address],
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        // Count tokens with nonzero balance
        const balances: AlchemyTokenBalance[] = data.result?.tokenBalances || [];
        const nonzero = balances.filter((b: AlchemyTokenBalance) => b.tokenBalance && b.tokenBalance !== '0');
        setTokenCount(nonzero.length);
      } catch (e) {
        if (e instanceof Error) {
          setFailed(e.message);
        } else if (typeof e === 'object' && e !== null && 'message' in e) {
          setFailed(String((e as { message: string }).message));
        } else {
          setFailed('Failed to fetch token count');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTokenCount();
  }, [address]);

  // Only the returned JSX is conditional; all hooks are always called
  if (!address) return <div>No wallet connected.</div>;
  if (isLoading) return <div>Loading balance...</div>;
  if (error) return <div>Error fetching balance</div>;
  if (loading) return <div className="text-sm text-muted-foreground">Loading token count...</div>;
  if (failed) return <div className="text-sm text-red-500">Error: {failed}</div>;
  if (tokenCount === null) return null;
  return (
    <div className="mb-2 text-sm font-semibold text-[8px] lg:text-[12px] lg:font-semibold">
       {tokenCount}
    </div>
  );
}

export function Account() {
  const { disconnect } = useDisconnect();
  TokenCount()
  return (
    <div>
      <button
        onClick={() => disconnect()}
        className="w-35 bg-[#233876] text-white border-none px-6 py-3 rounded-lg font-semibold text-[12px] cursor-pointer shadow-md hover:bg-[#2d478f] transition disabled:opacity-50"
      >
        Disconnect
      </button>
    </div>
  );
}
