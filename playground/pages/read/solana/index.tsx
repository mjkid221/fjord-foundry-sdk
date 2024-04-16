import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { Container } from '@mui/material';

import NavigationAccordion from '@/components/NavigationAccordion';

const SolanaRead = () => {
  const formattedPoolDataValueKey = Object.values(PoolDataValueKey).map((value) => ({
    href: `solana/${value}`,
    label: value,
  }));

  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <NavigationAccordion title="Read All Functions" links={[{ href: 'solana/pool-args', label: 'Pool Arguments' }]} />
      <NavigationAccordion title="Single Pool Data Values" links={formattedPoolDataValueKey} />
    </Container>
  );
};

export default SolanaRead;
