import { Alchemy, Network } from "alchemy-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

// Define a list of known stablecoin contract addresses on Ethereum Mainnet
const STABLECOIN_CONTRACTS: { [address: string]: string } = {
  // Format: "contractAddress": "Symbol"
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
  "0x956f47f50a910163d8bf957cf5846d573e7f87ca": "FEI",
  "0x5f98805a4e8be255a32880fdec7f6728c6568ba0": "LUSD",
};

const config = {
  apiKey: process.env.ALCHEMY_API_KEY!, // Loaded from .env
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { address } = req.body;

  if (!address || typeof address !== "string") {
    res.status(400).json({ error: "Invalid address" });
    return;
  }

  try {
    const response = await alchemy.core.getTokenBalances(address);
    const balances = response.tokenBalances;

    const stableBalances = balances
      .filter((token) => {
        const lowerAddress = token.contractAddress.toLowerCase();
        return (
          STABLECOIN_CONTRACTS[lowerAddress] &&
          token.tokenBalance !== null &&
          token.tokenBalance !== '0x0' &&
          BigInt(token.tokenBalance) > BigInt(0)
        );
      })
      .map((token) => {
        const contractAddress = token.contractAddress.toLowerCase();
        return {
          name: STABLECOIN_CONTRACTS[contractAddress],
          contractAddress,
          rawBalance: token.tokenBalance,
        };
      });

    // Get all contract addresses for CoinGecko query
    const contractAddresses = stableBalances.map(token => token.contractAddress).join(',');
    // Fetch USD prices from CoinGecko
    const priceRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses}&vs_currencies=usd`
    );
    const priceData = await priceRes.json();

    const enriched = await Promise.all(
      stableBalances.map(async (token) => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const decimals = metadata.decimals || 18;
        const priceUsd = priceData[token.contractAddress]?.usd ?? 1.0; // fallback to 1.0 if not found
        return {
          name: token.name,
          contractAddress: token.contractAddress,
          balance: Number(token.rawBalance) / 10 ** decimals,
          priceUsd,
        };
      })
    );

    const fetchedAt = new Date().toISOString();
    res.status(200).json({ stableCoins: enriched, fetchedAt });
  } catch (err) {
    res.status(500).json({ error: String(err) || "Something went wrong" });
  }
}
