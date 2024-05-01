import { Container, Stack, Typography } from '@mui/material';

import NavigationAccordion from '@/components/NavigationAccordion';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <Typography variant="h3" paddingBottom="30px">
          Welcome to the Fjord Foundry Solana Playground
        </Typography>
        <NavigationAccordion title="Read Functions" links={[{ href: 'read/solana', label: 'Solana Read Functions' }]} />
        <NavigationAccordion
          title="Write Functions"
          links={[{ href: 'write/solana', label: 'Solana Write Functions' }]}
        />
      </Stack>
    </Container>
  );
};

export default Home;
