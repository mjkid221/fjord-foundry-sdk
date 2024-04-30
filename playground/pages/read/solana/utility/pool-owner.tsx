import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const PoolOwner = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['pool-owner'],
    queryFn: async () => {
      return await sdkClient?.readPoolOwner();
    },
    enabled: !!sdkClient,
  });

  return (
    <>
      <Typography variant="h3">Admin Pool Contract Owner</Typography>
      <Typography>Owner Public Key: {data?.toBase58() ?? '-'}</Typography>
    </>
  );
};

export default PoolOwner;
