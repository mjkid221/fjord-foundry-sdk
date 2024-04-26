import { Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const SolanaWrite = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Stack>
          <Typography variant="h4">Initialization</Typography>
          <Link href={`solana/create-pool`}>Create LBP</Link>
        </Stack>
        <Stack>
          <Typography variant="h4">Buy</Typography>
          <Link href={'solana/buy/assets-for-exact-shares'}>Swap Assets For Exact Shares</Link>
          <Link href={'solana/buy/exact-assets-for-shares'}>Swap Exact Assets For Shares</Link>
        </Stack>
        <Stack>
          <Typography variant="h4">Sell</Typography>
          <Link href={'solana/sell/exact-shares-for-assets'}>Swap Exact Shares For Assets</Link>
          <Link href={'solana/sell/shares-for-exact-assets'}>Swap Shares For Exact Assets </Link>
        </Stack>
        <Stack>
          <Typography variant="h4">Pool Management</Typography>
          <Link href={'solana/management/pause'}>Pause</Link>
          <Link href={'solana/management/unpause'}>Unpause</Link>
        </Stack>
      </Stack>
    </Container>
  );
};

export default SolanaWrite;
