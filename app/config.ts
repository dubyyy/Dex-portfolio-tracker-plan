import { http, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = process.env.WALLETCONNECT_PROJECT_ID!

// ZK Sync Sepolia custom chain config
export const zkSyncSepolia = {
  id: 300,
  name: 'zkSync Sepolia',
  network: 'zksync-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.era.zksync.dev'],
    },
    public: {
      http: ['https://sepolia.era.zksync.dev'],
    },
  },
  blockExplorers: {
    default: { name: 'zkSync Explorer', url: 'https://sepolia.explorer.zksync.io/' },
  },
  testnet: true,
};

export const config = createConfig({
  chains: [mainnet, base, zkSyncSepolia],
  ssr: true,
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [zkSyncSepolia.id]: http('https://sepolia.era.zksync.dev'),
  },
})