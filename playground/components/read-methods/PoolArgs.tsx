import { Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolArgs } from '@/helpers/pool-initialization';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const PoolArgs = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { provider, sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['pool-args'],
    queryFn: async () => {
      if (!provider || !sdkClient) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey('AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm');

      const data = await getPoolArgs({ poolPda, programId: programAddressPublicKey, provider, sdkClient });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });

  console.log(data);

  return (
    <>
      <Typography>PoolArgs</Typography>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <Typography>Loading...</Typography>}
    </>
  );
};

export default PoolArgs;
