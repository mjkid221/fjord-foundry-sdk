import { Container, Stack } from '@mui/material';
import Link from 'next/link';

const SolanaWrite = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Link href={`solana/create-pool`}>Create LBP</Link>
        <Link href={'solana/buy/assets-for-exact-shares'}>Swap Assets For Exact Shares</Link>
      </Stack>
    </Container>
  );
};

export default SolanaWrite;
