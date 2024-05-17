import FeedbackDialog from '@/components/FeedbackDialog';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose } from '@/helpers';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

const PoolReservesAndWeights = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in handleDialogClose but not in the component
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const { sdkClient } = useContext(SolanaSdkClientContext);
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { data, error, isError } = useQuery({
    queryKey: ['pool-reserve-and-weights'],
    queryFn: async () => {
      return await sdkClient?.readPoolReservesAndWeights({
        poolPda: new PublicKey(poolAddress),
      });
    },
    enabled: !!sdkClient || !!poolAddress,
  });

  useEffect(() => {
    if (!isError) {
      return;
    }
    setErrorDialogOpen(true);
  }, [isError]);

  return (
    <>
      <Typography variant="h3">Pool Reserves and Weights</Typography>
      <Typography>Asset Reserve: {data?.assetReserve ?? '-'}</Typography>
      <Typography>Share Reserve: {data?.shareReserve ?? '-'}</Typography>
      <Typography>Asset Weight: {Number(data?.assetWeight) / 100 ?? '-'}%</Typography>
      <Typography>Share Weight: {Number(data?.shareWeight) / 100 ?? '-'}%</Typography>

      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={error?.message}
      />
    </>
  );
};

export default PoolReservesAndWeights;
