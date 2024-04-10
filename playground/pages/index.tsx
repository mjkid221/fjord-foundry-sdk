import { Container, Stack } from '@mui/material';
import Link from 'next/link';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Link href={`read/evm`}>Evm Read Functions</Link>
        <Link href={`read/solana`}>Solana Read Functions</Link>
      </Stack>
    </Container>
  );
};

export default Home;
