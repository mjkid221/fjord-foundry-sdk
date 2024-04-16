import { Container, Stack } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

import PoolAddress from './PoolAddressInput';

const ApplicationContainer = ({ children }: { children: ReactNode }) => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        <PoolAddress />
        {children}
        <Link href="/">Home</Link>
      </Stack>
    </Container>
  );
};

export default ApplicationContainer;
