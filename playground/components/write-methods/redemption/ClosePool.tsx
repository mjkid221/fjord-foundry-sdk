import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolArgs, handleDialogClose, handleDialogOpen } from '@/helpers';
import { closeLbpPool } from '@/helpers/redemption/closeLbpPool';
import { signAndSendTransaction } from '@/helpers/shared';
import { useConnectedWalletAddressStore } from '@/stores/useConnectedWalletAddressStore';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { closePoolArgsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, Button, Typography } from '@mui/material';
import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ClosePool = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);
  const { sendTransaction, publicKey, signTransaction } = useWallet();

  const wallet = useAnchorWallet();

  const { handleSubmit, setValue, watch } = useForm<z.infer<typeof closePoolArgsSchema>>({
    resolver: zodResolver(closePoolArgsSchema),
  });

  const connectedWalletAddress = useConnectedWalletAddressStore((state) => state.connectedWalletAddress);

  useEffect(() => {
    if (!connectedWalletAddress) {
      return;
    }
    setValue('args.userPublicKey', connectedWalletAddress);
  }, [connectedWalletAddress, setValue]);

  useQuery({
    queryKey: ['pool-args'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);

      const data = await getPoolArgs({
        poolPda,
        sdkClient,
      });
      setValue('args.assetTokenMint', data.assetToken);
      setValue('args.shareTokenMint', data.shareToken);
      setValue('args.poolPda', poolAddress);
      setValue('args.creator', data.creator);

      return data;
    },
    enabled: !!poolAddress,
  });

  const closePool = useMutation({
    mutationFn: closeLbpPool,
    onSuccess: async (data) => {
      try {
        if (!publicKey || !signTransaction) return;
        const confirmation = await signAndSendTransaction(data, wallet, connection, sendTransaction);

        setTransactionHash(confirmation.txid);
        handleDialogOpen({ setErrorDialogOpen, setSuccessDialogOpen });
      } catch (error) {
        handleDialogOpen({ setErrorDialogOpen, setSuccessDialogOpen, isError: true });
      }
    },
    onError: () => {
      handleDialogOpen({ setErrorDialogOpen, setSuccessDialogOpen, isError: true });
    },
  });

  const onSubmit = async (data: z.infer<typeof closePoolArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    closePool.mutate({ formData: data, connection, provider, sdkClient });
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} flexDirection="column">
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="creator-address">Creator Address</FormLabel>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {watch('args.creator')?.length > 0 ? watch('args.creator') : 'Please set the active pool'}
            </Typography>
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="user-address">User Address</FormLabel>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {connectedWalletAddress ?? 'Please connect your wallet '}
            </Typography>
          </FormControl>
          {!wallet && <WalletNotConnected />}
          {!poolAddress && (
            <Typography variant="body1" color="error">
              Please set your active pool
            </Typography>
          )}
          <Button variant="contained" type="submit" disabled={!wallet || !poolAddress}>
            Submit
          </Button>
        </Stack>
      </form>
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={closePool.error?.message ?? 'Could not close pool'}
      />
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={successDialogOpen}
      >
        <SuccessFeedback transactionHash={transactionHash} />
      </FeedbackDialog>
    </>
  );
};

export default ClosePool;
