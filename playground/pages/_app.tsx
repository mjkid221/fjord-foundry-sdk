import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Link from 'next/link';

import PoolAddress from '@/components/PoolAddressInput';
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="md" sx={{ paddingY: '30px' }}>
            <PoolAddress />
            <Component {...pageProps} />
            <Link href="/">Home</Link>
          </Container>
        </ThemeProvider>
      </QueryClientProvider>
    </AppCacheProvider>
  );
}
