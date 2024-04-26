import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const Test = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return await sdkClient?.readPoolOwner();
    },
    enabled: !!sdkClient,
  });

  console.log(data);
  return (
    <>
      <Typography>Test</Typography>
    </>
  );
};

export default Test;
