import FeedbackDialog from '@/components/FeedbackDialog';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose } from '@/helpers';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

const PoolTokenAccounts = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in handleDialogClose but not in the component
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const { sdkClient } = useContext(SolanaSdkClientContext);
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { data, error, isError } = useQuery({
    queryKey: ['pool-token-balances'],
    queryFn: async () => {
      return await sdkClient?.readPoolTokenBalances({ poolPda: new PublicKey(poolAddress) });
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
      <Typography variant="h3">Pool Token Balances</Typography>
      <Typography>Share Token Pool Balance: {data?.poolShareTokenBalance ?? '-'}</Typography>
      <Typography>Asset Token Pool Balance: {data?.poolAssetTokenBalance ?? '-'}</Typography>
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={error?.message}
      />
    </>
  );
};

export default PoolTokenAccounts;
