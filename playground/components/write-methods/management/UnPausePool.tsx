import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { PausePoolArgs, getPoolDataValue, signAndSendSwapTransaction, unpausePool } from '@/helpers';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { Button, Stack, Typography } from '@mui/material';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useContext } from 'react';

const UnPausePool = () => {
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

  const unpausePoolMutation = useMutation({
    mutationFn: unpausePool,
    onSuccess: async (data) => {
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
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
    unpausePoolMutation.mutate({ provider, sdkClient, args });
  };

  return (
    <Stack>
      <Typography variant="h4">Unpause Pool</Typography>
      <Typography>Creator: {wallet ? wallet?.publicKey.toBase58() : ''}</Typography>
      <Typography>Share Token Mint: {shareTokenAddress}</Typography>
      <Typography>Asset Token Mint: {assetTokenAddress}</Typography>
      {unpausePoolMutation.error?.message && (
        <Typography color="error">{unpausePoolMutation.error?.message}</Typography>
      )}
      <Button variant="contained" onClick={onSubmit} disabled={!wallet}>
        Unpause Pool
      </Button>
      {!wallet && <WalletNotConnected />}
    </Stack>
  );
};

export default UnPausePool;
