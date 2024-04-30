import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { setNewPoolFees, signAndSendSwapTransaction } from '@/helpers';
import { newFeesSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, Typography, Button, TextField } from '@mui/material';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const NewPoolFees = () => {
  const { handleSubmit, setValue, register } = useForm<z.infer<typeof newFeesSchema>>({
    resolver: zodResolver(newFeesSchema),
  });

  const wallet = useAnchorWallet();

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  useEffect(() => {
    if (!wallet) return;
    setValue('ownerPublicKey', wallet.publicKey?.toBase58());
  }, [setValue, wallet]);

  const setNewPoolFeesMutation = useMutation({
    mutationFn: setNewPoolFees,
    onSuccess: async (data) => {
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = async (data: z.infer<typeof newFeesSchema>) => {
    if (!provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    setNewPoolFeesMutation.mutate({ formData: data, provider, sdkClient });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} flexDirection="column">
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="platform-fee">Platform Fee</FormLabel>
          <TextField
            label=">Platform Fee"
            placeholder="Platform Fee"
            {...register('platformFee', { required: true })}
          />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="referral-fee">Referral Fee</FormLabel>
          <TextField
            label=">Referral Fee"
            placeholder="Referral Fee"
            {...register('referralFee', { required: true })}
          />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="swap-fee">Swap Fee</FormLabel>
          <TextField label=">Swap Fee" placeholder="Swap Fee" {...register('swapFee', { required: true })} />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="user-address">Owner Address</FormLabel>
          <Typography>{wallet ? wallet?.publicKey?.toBase58() : 'No wallet connected'}</Typography>
        </FormControl>

        <Button variant="contained" type="submit" disabled={!wallet}>
          Submit
        </Button>
        {!wallet && <WalletNotConnected />}
      </Stack>
    </form>
  );
};

export default NewPoolFees;
