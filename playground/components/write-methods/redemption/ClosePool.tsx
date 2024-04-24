import WalletNotConnected from '@/components/WalletNotConnected';
import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolDataValue } from '@/helpers';
import { closeLbpPool } from '@/helpers/redemption/closeLbpPool';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { swapAssetsForSharesArgsSchema } from '@/types';
import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, TextField, Button } from '@mui/material';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ClosePool = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue } = useForm<z.infer<typeof swapAssetsForSharesArgsSchema>>({
    resolver: zodResolver(swapAssetsForSharesArgsSchema),
  });

  useQuery({
    queryKey: ['shareTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.ShareToken,
      });
      setValue('args.shareTokenMint', data as string);
      setValue('args.poolPda', poolAddress);

      return data;
    },
    enabled: !!poolAddress,
  });

  useQuery({
    queryKey: ['assetTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.AssetToken,
      });
      setValue('args.assetTokenMint', data as string);

      return data;
    },
    enabled: !!poolAddress,
  });

  const closePool = useMutation({
    mutationFn: closeLbpPool,
    onSuccess: async (data) => {
      console.log(data);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = async (data: z.infer<typeof swapAssetsForSharesArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    closePool.mutate({ formData: data, connection, provider, sdkClient });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} flexDirection="column">
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="creator-address">Creator Address</FormLabel>
          <TextField label="creator address" placeholder="creator" {...register('args.creator', { required: true })} />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="user-address">User Address</FormLabel>
          <TextField label="user address" placeholder="user" {...register('args.userPublicKey', { required: true })} />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="shares-from-user">Asset quantity to use to pay</FormLabel>
          <TextField
            label="assets to receive"
            placeholder="user wants to recieve this amount of asset tokens"
            {...register('args.assetsAmountIn', { required: true })}
          />
        </FormControl>

        <Button variant="contained" type="submit" disabled={!wallet}>
          Submit
        </Button>
        {!wallet && <WalletNotConnected />}
      </Stack>
    </form>
  );
};

export default ClosePool;
