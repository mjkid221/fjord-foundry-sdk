import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import {
  getPoolArgs,
  handleDialogClose,
  handleDialogOpen,
  previewSharesInAmount,
  signAndSendSwapTransaction,
  swapSharesForExactAssets,
} from '@/helpers';
import { useConnectedWalletAddressStore } from '@/stores/useConnectedWalletAddressStore';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { swapAssetsForSharesArgsSchema, swapSharesForAssetsArgsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, TextField, Button, Typography } from '@mui/material';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const SwapSharesForExactAssets = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue, watch } = useForm<z.infer<typeof swapSharesForAssetsArgsSchema>>({
    resolver: zodResolver(swapSharesForAssetsArgsSchema),
  });

  const connectedWalletAddress = useConnectedWalletAddressStore((state) => state.connectedWalletAddress);
  const [assetsAmountOut, creator, poolPda, assetTokenMint, shareTokenMint, slippage] = watch([
    'args.assetsAmountOut',
    'args.creator',
    'args.poolPda',
    'args.assetTokenMint',
    'args.shareTokenMint',
    'args.slippage',
  ]);

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

  const swapSharesForExactAssetsMutation = useMutation({
    mutationFn: swapSharesForExactAssets,
    onSuccess: async (data) => {
      try {
        const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);

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

  // Ideally would add debounce here
  const { data: expectedMaxSharesInUI, refetch: refetchPreview } = useQuery({
    queryKey: ['assets-out-amount'],
    queryFn: async () => {
      if (
        !sdkClient ||
        !assetsAmountOut ||
        !creator ||
        !poolPda ||
        !assetTokenMint ||
        !shareTokenMint ||
        !provider ||
        !connectedWalletAddress
      )
        return 'N/A';

      const formData = {
        args: {
          creator,
          userPublicKey: connectedWalletAddress,
          shareTokenMint,
          assetTokenMint,
          poolPda,
          assetsAmountOut,
        },
      };

      const { expectedMaxSharesInUI } = await previewSharesInAmount({ formData, provider, sdkClient });
      return expectedMaxSharesInUI;
    },
  });

  useEffect(() => {
    if (!assetsAmountOut) return;
    refetchPreview();
  }, [assetsAmountOut, refetchPreview]);

  const onSubmit = async (data: z.infer<typeof swapAssetsForSharesArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    swapSharesForExactAssetsMutation.mutate({ formData: data, connection, provider, sdkClient });
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
            <FormLabel htmlFor="shares-from-user">Asset quantity to use to swap</FormLabel>
            <TextField
              label="Assets to receive"
              placeholder="user wants to recieve this amount of asset tokens"
              {...register('args.assetsAmountOut', { required: true })}
            />
            <TextField label="Slippage Tolerance %" {...register('args.slippage')} type="number" value={slippage} />
            <FormLabel htmlFor="shares-input">Share token expected input</FormLabel>
            <TextField label={expectedMaxSharesInUI} disabled />
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
        errorMessage={swapSharesForExactAssetsMutation.error?.message ?? 'Could not swap assets for shares'}
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

export default SwapSharesForExactAssets;
