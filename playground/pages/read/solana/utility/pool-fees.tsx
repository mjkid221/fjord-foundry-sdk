import FeedbackDialog from '@/components/FeedbackDialog';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose } from '@/helpers';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

const PoolFees = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in handleDialogClose but not in the component
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data, error, isError } = useQuery({
    queryKey: ['pool-fees'],
    queryFn: async () => {
      return await sdkClient?.readPoolFees();
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
      <Typography variant="h3">Pool Fees</Typography>
      <Typography>Platform Fee: {data?.platformFee ?? '-'}</Typography>
      <Typography>Referral Fee: {data?.referralFee ?? '-'}</Typography>
      <Typography>Swap Fee: {data?.swapFee ?? '-'}</Typography>
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={error?.message}
      />
    </>
  );
};

export default PoolFees;
