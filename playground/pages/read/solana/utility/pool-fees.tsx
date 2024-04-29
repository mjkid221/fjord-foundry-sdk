import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const PoolFees = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['pool-fees'],
    queryFn: async () => {
      return await sdkClient?.readPoolFees();
    },
    enabled: !!sdkClient,
  });

  return (
    <>
      <Typography variant="h3">Pool Fees</Typography>
      <Typography>Platform Fee: {data?.platformFee ?? '-'}</Typography>
      <Typography>Referral Fee: {data?.referralFee ?? '-'}</Typography>
      <Typography>Swap Fee: {data?.swapFee ?? '-'}</Typography>
    </>
  );
};

export default PoolFees;
