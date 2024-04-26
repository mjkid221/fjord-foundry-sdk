import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const Test = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
      return await sdkClient?.readPoolOwner(programAddressPublicKey);
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
