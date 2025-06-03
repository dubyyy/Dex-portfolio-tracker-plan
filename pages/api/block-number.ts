import { Alchemy, Network, type TokenBalance } from "alchemy-sdk";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { address } = req.body;

    const config = {
        apiKey: process.env.ALCHEMY_API_KEY!, // Loaded from .env
        network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);

    try {
        const response = await alchemy.core.getTokenBalances(address);
        const tokenBalances = response.tokenBalances;

        const filteredTokens = tokenBalances.filter((token: TokenBalance) => {
            return BigInt(token.tokenBalance) > 0n;
        });

        const tokensWithMetadata = await Promise.all(filteredTokens.map(async (token: TokenBalance) => {
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
            return {
                name: metadata.name,
                symbol: metadata.symbol,
                decimals: metadata.decimals,
                balanceRaw: token.tokenBalance,
                balance: Number(token.tokenBalance) / Math.pow(10, metadata.decimals || 18),
            };
        }));

        const sorted = tokensWithMetadata.sort((a, b) => b.balance - a.balance);
        const topThree = sorted.slice(0, 3).map(token => ({
            name: token.name,
            balance: token.balance,
        }));

        res.status(200).json({ topThree });
    } catch (error) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = String((error as { message: string }).message);
        }
        res.status(500).json({ error: errorMessage });
    }
}
