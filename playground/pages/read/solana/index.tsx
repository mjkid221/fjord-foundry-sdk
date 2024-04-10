import { Container, Stack } from '@mui/material';
import Link from 'next/link';

const SolanaRead = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Link href={`solana/address-deets`}>Address Details</Link>
      </Stack>
    </Container>
  );
};

export default SolanaRead;
