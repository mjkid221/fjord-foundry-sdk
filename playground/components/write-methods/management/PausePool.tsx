import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import {
  PausePoolArgs,
  getPoolDataValue,
  handleDialogClose,
  handleDialogOpen,
  pausePool,
  signAndSendSwapTransaction,
} from '@/helpers';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { Button, Stack, Typography } from '@mui/material';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useContext } from 'react';

const PausePool = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const [shareTokenAddress, setShareTokenAddress] = useState<string>('');
  const [assetTokenAddress, setAssetTokenAddress] = useState<string>('');

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  useQuery({
    queryKey: ['shareTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);

      const data = await getPoolDataValue({
        poolPda,
        sdkClient,
        valueKey: PoolDataValueKey.ShareToken,
      });
      setShareTokenAddress(data as string);

      return data;
    },
    enabled: !!poolAddress,
  });

  useQuery({
    queryKey: ['assetTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);

      const data = await getPoolDataValue({
        poolPda,
        sdkClient,
        valueKey: PoolDataValueKey.AssetToken,
      });
      setAssetTokenAddress(data as string);

      return data;
    },
    enabled: !!poolAddress,
  });

  const pausePoolMutation = useMutation({
    mutationFn: pausePool,
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

  const args: PausePoolArgs = {
    poolPda: poolAddress,
    creator: wallet?.publicKey.toBase58() as string,
    shareTokenMint: shareTokenAddress,
    assetTokenMint: assetTokenAddress,
  };

  const onSubmit = async () => {
    if (!connection || !provider || !sdkClient || !wallet) {
      throw new Error('Wallet not connected');
    }
    pausePoolMutation.mutate({ provider, sdkClient, args });
  };

  return (
    <Stack>
      <Typography variant="h4">Pause Pool</Typography>
      <Typography>Creator: {wallet ? wallet?.publicKey.toBase58() : ''}</Typography>
      <Typography>Share Token Mint: {shareTokenAddress}</Typography>
      <Typography>Asset Token Mint: {assetTokenAddress}</Typography>
      {pausePoolMutation.error?.message && <Typography color="error">{pausePoolMutation.error?.message}</Typography>}
      <Button variant="contained" onClick={onSubmit} disabled={!wallet}>
        Submit
      </Button>
      {!wallet && <WalletNotConnected />}
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={pausePoolMutation.error?.message ?? 'Could not pause pool'}
      />
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={successDialogOpen}
      >
        <SuccessFeedback transactionHash={transactionHash} />
      </FeedbackDialog>
    </Stack>
  );
};

export default PausePool;
