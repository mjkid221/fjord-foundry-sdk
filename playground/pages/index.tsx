import { Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack direction="row">
        <Stack>
          <Typography variant="h4">Read Functions</Typography>
          <Link href={`read/evm`}>Evm Read Functions</Link>
          <Link href={`read/solana`}>Solana Read Functions</Link>
        </Stack>
        <Stack>
          <Typography variant="h4">Write Functions</Typography>
          <Link href={`write/solana`}>Solana Read Functions</Link>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
