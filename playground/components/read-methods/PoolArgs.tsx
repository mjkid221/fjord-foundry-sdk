import { GetContractArgsResponse } from '@fjord-foundry/solana-sdk-client';
import { Typography } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';

import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolArgs } from '@/helpers/pool-initialization';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const PoolArgs = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['pool-args'],
    queryFn: async () => {
      if (!provider) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey('AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm');

      const data = await getPoolArgs({ poolPda, programId: programAddressPublicKey, provider });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });

  console.log(data);
  console.log(data?.creator.toBase58());
  console.log(data?.maxSharePrice.toString());
  console.log(data?.maxSharesOut.toString());
  console.log(data?.maxAssetsIn.toString());
  return <Typography>PoolArgs</Typography>;
};

export default PoolArgs;
