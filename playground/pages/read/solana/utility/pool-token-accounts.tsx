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
    queryKey: ['pool-token-accounts'],
    queryFn: async () => {
      return await sdkClient?.readPoolTokenAccounts({ poolPda: new PublicKey(poolAddress) });
    },
    enabled: !!sdkClient || !!poolAddress,
  });

  return (
    <>
      <Typography variant="h3">Pool Token Accounts</Typography>
      <Typography>Share Token Pool Account Public Key: {data?.poolShareTokenAccount.toBase58() ?? '-'}</Typography>
      <Typography>Asset Token Pool Account Public Key: {data?.poolAssetTokenAccount.toBase58() ?? '-'}</Typography>
    </>
  );
};

export default PoolTokenAccounts;
