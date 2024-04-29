import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const SwapFeeRecipient = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['swap-fee-recipient'],
    queryFn: async () => {
      return await sdkClient?.readSwapFeeRecipient();
    },
    enabled: !!sdkClient,
  });

  return (
    <>
      <Typography variant="h3">Swap Fee Recipient</Typography>
      <Typography>Swap Fee Recipient Public Key: {data?.toBase58() ?? '-'}</Typography>
    </>
  );
};

export default SwapFeeRecipient;
