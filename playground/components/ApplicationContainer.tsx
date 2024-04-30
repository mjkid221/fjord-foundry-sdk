import { Container, Stack } from '@mui/material';
import { ReactNode } from 'react';

import PoolAddress from './PoolAddressInput';
import { useRouter } from 'next/router';
import { SHOW_POOL_ADDRESS_PATHS } from '@/constants/paths';

const ApplicationContainer = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const showPoolAddress = SHOW_POOL_ADDRESS_PATHS.includes(router.pathname);

  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        {showPoolAddress && <PoolAddress />}
        {children}
      </Stack>
    </Container>
  );
};

export default ApplicationContainer;
