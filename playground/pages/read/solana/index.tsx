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
      <NavigationAccordion
        title="Read All Functions"
        links={[
          { href: 'solana/pool-args', label: 'Pool Arguments' },
          { href: 'solana/utility/pool-fees', label: 'Pool Fees' },
          { href: 'solana/utility/pool-owner', label: 'Pool Owner' },
          { href: 'solana/utility/fee-recipients', label: 'Fee Recipients' },
          { href: 'solana/utility/swap-fee-recipient', label: 'Swap Fee Recipient' },
          { href: 'solana/utility/pool-token-accounts', label: 'Pool Token Accounts' },
          { href: 'solana/utility/pool-token-balances', label: 'Pool Token Balances' },
          { href: 'solana/utility/pool-reserves-and-weights', label: 'Pool Reserve and Weights' },
          { href: 'solana/utility/user-pool-state', label: 'User Pool State' },
        ]}
      />
      <NavigationAccordion title="Single Pool Data Values" links={formattedPoolDataValueKey} />
    </Container>
  );
};

export default SolanaRead;
