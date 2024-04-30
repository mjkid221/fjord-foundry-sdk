import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const Test = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const poolPda = new PublicKey('DJiTvyZCvn1PHVsGHFkLq4p8mQYXdHsLdkD7WfoozfH');
  const user = new PublicKey('AHJHgy8qzHzyJjxR7mznd68uK1VomuWB4LTKpZNgCAki');

  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return await sdkClient?.readUserTokenBalances({ poolPda, userPublicKey: user });
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
