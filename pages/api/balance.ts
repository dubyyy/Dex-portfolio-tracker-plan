import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// Set your Ethereum provider (Infura, Alchemy, or public RPC)
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Minimal ERC-20 ABI
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, token } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid address' });
  }

  try {
    if (!token) {
      // Fetch ETH balance
      const balance = await provider.getBalance(address);
      return res.status(200).json({
        address,
        token: 'ETH',
        balance: ethers.formatEther(balance),
      });
    } else if (typeof token === 'string') {
      // Fetch ERC-20 balance
      const contract = new ethers.Contract(token, ERC20_ABI, provider);
      const [rawBalance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
      ]);
      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
      return res.status(200).json({
        address,
        token: symbol,
        balance: formattedBalance,
      });
    } else {
      return res.status(400).json({ error: 'Invalid token address' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
