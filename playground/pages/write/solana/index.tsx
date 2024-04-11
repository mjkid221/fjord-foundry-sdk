import { Container, Stack } from '@mui/material';
import Link from 'next/link';

const SolanaWrite = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Link href={`solana/create-pool`}>Create LBP</Link>
      </Stack>
    </Container>
  );
};

export default SolanaWrite;
