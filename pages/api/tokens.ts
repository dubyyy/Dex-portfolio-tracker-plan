import type { NextApiRequest, NextApiResponse } from "next";
import { Alchemy, Network, Utils, TokenBalance } from "alchemy-sdk";

// Define a type for the token structure for clarity within the API
interface ApiToken {
  name: string;
  symbol: string;
  balance: number;
  img?: string;
  price?: number; // Assuming price is optional and might not be available
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { address } = req.body;

  if (!address || typeof address !== 'string') {
    res.status(400).json({ error: "Address is required and must be a string" });
    return;
  }

  const config = {
    apiKey: process.env.ALCHEMY_API_KEY, // Removed '!' for safer access, ensure it's set
    network: Network.ETH_MAINNET,
  };

  if (!config.apiKey) {
    console.error("ALCHEMY_API_KEY is not set in environment variables.");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const alchemy = new Alchemy(config);

  try {
    const balancesResponse = await alchemy.core.getTokenBalances(address);

    if (!balancesResponse.tokenBalances || balancesResponse.tokenBalances.length === 0) {
        res.status(200).json({ tokens: [] }); // No token balances found
        return;
      }

    // Filter token balances to include only those with a contract address and a non-zero balance
    const validTokenBalances = balancesResponse.tokenBalances.filter(
      (tb: TokenBalance) => tb.contractAddress && tb.tokenBalance && tb.tokenBalance !== "0" && tb.tokenBalance !== "0x0"
    );

    // If no valid tokens with non-zero balances are found, return an empty array
    if (validTokenBalances.length === 0) {
      res.status(200).json({ tokens: [] });
      return;
    }

    // Process all valid tokens to fetch metadata and format data
    const allTokenDataPromises = validTokenBalances.map(async (tb: TokenBalance) => {
      try {
        // Fetch metadata for the token
        const metadataResponse = await alchemy.core.getTokenMetadata(tb.contractAddress!);
        
        let calculatedBalance = 0;
        const rawBalance = tb.tokenBalance; // rawBalance is hex string (e.g., "0x01")
        const decimals = metadataResponse.decimals ?? 18; // Default to 18 if decimals is null/undefined

        if (rawBalance) {
          try {
            // Convert the hex balance to a human-readable format using its decimals
            calculatedBalance = parseFloat(Utils.formatUnits(rawBalance, decimals));
          } catch (e) {
            console.error(`Failed to parse balance for token ${metadataResponse.symbol ?? tb.contractAddress}: ${rawBalance} with ${decimals} decimals. Error: ${e}`);
            // Balance remains 0 if parsing fails
          }
        }

        // Construct the token data object
        const tokenData: ApiToken = {
          name: metadataResponse.name ?? "Unknown Token",
          symbol: metadataResponse.symbol ?? "N/A",
          balance: calculatedBalance,
          img: metadataResponse.logo ?? undefined,
          price: undefined, // Price is not reliably available from this endpoint
        };
        return tokenData;
      } catch (error) {
        console.error(`Error processing token ${tb.contractAddress}:`, error);
        // Return null for tokens that failed processing, to be filtered out later
        return null;
      }
    });

    // Wait for all token processing promises to resolve
    const resolvedTokenData = await Promise.all(allTokenDataPromises);

    // Filter out any null results (tokens that failed processing)
    const successfulTokenData = resolvedTokenData.filter((token): token is ApiToken => token !== null);

    res.status(200).json({ tokens: successfulTokenData });

  } catch (error) {
    console.error("API Error fetching token data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching token data.";
    res.status(500).json({ error: "Failed to fetch token data", details: errorMessage });
  }
}
