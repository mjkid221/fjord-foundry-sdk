import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const PoolTokenAccounts = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { data } = useQuery({
    queryKey: ['pool-token-balances'],
    queryFn: async () => {
      return await sdkClient?.readPoolTokenBalances({ poolPda: new PublicKey(poolAddress) });
    },
    enabled: !!sdkClient || !!poolAddress,
  });

  return (
    <>
      <Typography variant="h3">Pool Token Balances</Typography>
      <Typography>Share Token Pool Balance: {data?.poolShareTokenBalance ?? '-'}</Typography>
      <Typography>Asset Token Pool Balance: {data?.poolAssetTokenBalance ?? '-'}</Typography>
    </>
  );
};

export default PoolTokenAccounts;
