import FeedbackDialog from '@/components/FeedbackDialog';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose } from '@/helpers';
import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

const FeeRecipients = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in handleDialogClose but not in the component
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data, error, isError } = useQuery({
    queryKey: ['fee-recipients'],
    queryFn: async () => {
      return await sdkClient?.readFeeRecipients();
    },
    enabled: !!sdkClient,
  });

  useEffect(() => {
    if (!isError) {
      return;
    }
    setErrorDialogOpen(true);
  }, [isError]);

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
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={error?.message}
      />
    </>
  );
};

export default FeeRecipients;
