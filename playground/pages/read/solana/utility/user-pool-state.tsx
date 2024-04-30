import FeedbackDialog from '@/components/FeedbackDialog';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose } from '@/helpers';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { Stack, Typography } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

const UserPoolState = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in handleDialogClose but not in the component
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const { sdkClient } = useContext(SolanaSdkClientContext);
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const [walletPk, setWalletPk] = useState<PublicKey | null>(null);

  const wallet = useWallet();

  useEffect(() => {
    if (!wallet) return;
    setWalletPk(wallet.publicKey);
  }, [wallet]);

  const { data, error, isError } = useQuery({
    queryKey: ['user-pool-state'],
    queryFn: async () => {
      return await sdkClient?.readUserTokenBalances({
        poolPda: new PublicKey(poolAddress),
        userPublicKey: walletPk as PublicKey,
      });
    },
    enabled: !!sdkClient || !!poolAddress || !!walletPk,
  });

  useEffect(() => {
    if (!isError) {
      return;
    }
    setErrorDialogOpen(true);
  }, [isError]);

  return (
    <Stack spacing={2}>
      <Typography variant="h3">Pool Token Balances</Typography>
      <Typography>Volume of shares purchased: {data?.purchasedShares ?? '-'}</Typography>
      <Typography>Volume of shares redeemed: {data?.redeemedShares ?? '-'}</Typography>
      <Typography>Volume of referred assets: {data?.referredAssets ?? '-'}</Typography>
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={error?.message}
      />
    </Stack>
  );
};

export default UserPoolState;
