import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const SolanaRead = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Link href={`solana/address-deets`}>Address Details</Link>
        <Link href={`solana/pool-args`}>Pool Arguments</Link>
        <Typography>Single Pool Data Values</Typography>
        {Object.values(PoolDataValueKey).map((value) => (
          <Link key={value} href={`solana/${value}`}>
            {value}
          </Link>
        ))}
      </Stack>
    </Container>
  );
};

export default SolanaRead;
