import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { Typography } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useContext } from 'react';

import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolDataValue } from '@/helpers/pool-initialization';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const SinglePoolDataValue = () => {
  const { query } = useRouter();
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { connection } = useConnection();

  const { provider, sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: [`${[query.value]}`],
    queryFn: async () => {
      if (!provider || !sdkClient) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        provider,
        sdkClient,
        connection,
        valueKey: query.value as PoolDataValueKey,
      });
      return data;
    },
  });

  return (
    <>
      <Typography variant="h3">Single Data Value</Typography>
      <Typography variant="h4">
        {query.value}: {data ?? ''}
      </Typography>
    </>
  );
};

export default SinglePoolDataValue;
