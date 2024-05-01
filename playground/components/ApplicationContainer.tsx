import { Container, Stack } from '@mui/material';
import { ReactNode } from 'react';

import PoolAddress from './PoolAddressInput';
import { useRouter } from 'next/router';
import { SHOW_POOL_ADDRESS_PATHS } from '@/constants/paths';

const ApplicationContainer = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const showPoolAddress = Object.values(SHOW_POOL_ADDRESS_PATHS).some((category) =>
    category.paths.some((path) => router.pathname.startsWith(category.basePath + path)),
  );

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
