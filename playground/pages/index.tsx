import { Container, Stack } from '@mui/material';

import NavigationAccordion from '@/components/NavigationAccordion';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <NavigationAccordion
          title="Read Functions"
          links={[
            { href: 'read/evm', label: 'Evm Read Functions' },
            { href: 'read/solana', label: 'Solana Read Functions' },
          ]}
        />
        <NavigationAccordion
          title="Write Functions"
          links={[{ href: 'write/solana', label: 'Solana Write Functions' }]}
        />
      </Stack>
    </Container>
  );
};

export default Home;
