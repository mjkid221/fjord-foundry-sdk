import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import ApplicationContainer from '@/components/ApplicationContainer';
import { SolanaSdkClientProvider } from '@/context/SolanaSdkClientProvider';
import WalletContext from '@/context/WalletContext';
import theme from '@/styles/theme';

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  return (
    <AppCacheProvider {...pageProps}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Playground App</title>
        <link rel="icon" href="/solana.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <WalletContext>
          <SolanaSdkClientProvider solanaNetwork={WalletAdapterNetwork.Devnet}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ApplicationContainer>
                <Component {...pageProps} />
              </ApplicationContainer>
            </ThemeProvider>
          </SolanaSdkClientProvider>
        </WalletContext>
      </QueryClientProvider>
    </AppCacheProvider>
  );
}
