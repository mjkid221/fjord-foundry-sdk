import { FjordClientSdk, createSdk } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletModalProvider, WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { clusterApiUrl } from '@solana/web3.js';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

interface SDKContextType {
  sdkClient: FjordClientSdk | null;
  connectWallet: () => Promise<void>;
}

const SDKContext = createContext<SDKContextType>({
  sdkClient: null,
  connectWallet: async () => {
    /* ... */
  },
});

const WalletContext = ({ children }: { children: ReactNode }) => {
  // const network = WalletAdapterNetwork.Devnet;

  // // You can also provide a custom RPC endpoint.
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // const wallets = useMemo(
  //   () => [
  //     /**
  //      * Wallets that implement either of these standards will be available automatically.
  //      *
  //      *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
  //      *     (https://github.com/solana-mobile/mobile-wallet-adapter)
  //      *   - Solana Wallet Standard
  //      *     (https://github.com/anza-xyz/wallet-standard)
  //      *
  //      * If you wish to support a wallet that supports neither of those standards,
  //      * instantiate its legacy wallet adapter here. Common legacy adapters can be found
  //      * in the npm package `@solana/wallet-adapter-wallets`.
  //      */
  //     new PhantomWalletAdapter(),
  //   ],
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [network],
  // );

  // return (
  //   <ConnectionProvider endpoint={endpoint}>
  //     <WalletProvider wallets={wallets} autoConnect>
  //       <WalletModalProvider>
  //         <WalletMultiButton />
  //         <WalletDisconnectButton />
  //         {children}
  //       </WalletModalProvider>
  //     </WalletProvider>
  //   </ConnectionProvider>
  // );

  const [sdkClient, setSDKClient] = useState<FjordClientSdk | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      const newClient = await createSdk(true, WalletAdapterNetwork.Mainnet);
      setSDKClient(newClient);
    };
    initializeSDK();
  }, []);

  const connectWallet = async () => {
    if (!sdkClient) return;

    try {
      // new PhantomWalletAdapter();
      const walletAddress = await sdkClient.connectWallet(WalletAdapterNetwork.Mainnet);

      console.log(walletAddress);
    } catch (error) {
      // ... Handle connection errors ...
    }
  };

  return <SDKContext.Provider value={{ sdkClient, connectWallet }}>{children}</SDKContext.Provider>;
};

export default WalletContext;

export const useSDK = () => useContext(SDKContext);
