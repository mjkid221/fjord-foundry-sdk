import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

const FeeRecipients = () => {
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['fee-recipients'],
    queryFn: async () => {
      return await sdkClient?.readFeeRecipients();
    },
    enabled: !!sdkClient,
  });

  return (
    <>
      <Typography variant="h3">Treasury Contract Fee Recipients</Typography>
      {data &&
        data.map((recipient, index) => (
          <Stack key={index} m={4}>
            <Typography>User Public Key: {recipient.user.toBase58()}</Typography>
            <Typography>User Fee Percentage: {recipient.percentage}</Typography>
          </Stack>
        ))}
    </>
  );
};

export default FeeRecipients;
