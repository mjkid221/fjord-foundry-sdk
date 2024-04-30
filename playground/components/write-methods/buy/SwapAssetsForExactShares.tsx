import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolArgs, signAndSendSwapTransaction, swapAssetsForExactShares } from '@/helpers';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { swapAssetsForSharesArgsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormControl, FormLabel, Stack, TextField, Typography } from '@mui/material';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import WalletNotConnected from '../../WalletNotConnected';
import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import { handleDialogClose, handleDialogOpen } from '@/helpers/dialog-state';
import { useConnectedWalletAddressStore } from '@/stores/useConnectedWalletAddressStore';

const SwapAssetsForExactShares = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue, watch } = useForm<z.infer<typeof swapAssetsForSharesArgsSchema>>({
    resolver: zodResolver(swapAssetsForSharesArgsSchema),
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

  const swapAssetsForExactSharesMutation = useMutation({
    mutationFn: swapAssetsForExactShares,
    onSuccess: async (data) => {
      try {
        const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
        if (!confirmation) {
          throw new Error('Transaction could not be confirmed');
        }
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

  const onSubmit = async (data: z.infer<typeof swapAssetsForSharesArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    swapAssetsForExactSharesMutation.mutate({ formData: data, connection, provider, sdkClient });
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
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="shares-to-buy">Quantity to buy</FormLabel>
            <TextField
              label="shares to buy"
              placeholder="shares to buy"
              {...register('args.sharesAmountOut', { required: true })}
            />
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
        errorMessage={swapAssetsForExactSharesMutation.error?.message}
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

export default SwapAssetsForExactShares;
