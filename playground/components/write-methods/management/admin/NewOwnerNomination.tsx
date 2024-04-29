import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { nominateNewOwner, signAndSendSwapTransaction } from '@/helpers';
import { nominateNewOwnerArgsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, TextField, Button, Typography } from '@mui/material';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const NewOwnerNomination = () => {
  const { register, handleSubmit, setValue } = useForm<z.infer<typeof nominateNewOwnerArgsSchema>>({
    resolver: zodResolver(nominateNewOwnerArgsSchema),
  });

  const wallet = useAnchorWallet();

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const nominateNewOwnerMutation = useMutation({
    mutationFn: nominateNewOwner,
    onSuccess: async (data) => {
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
  });

  useEffect(() => {
    if (!wallet) return;
    setValue('args.creator', wallet.publicKey?.toBase58());
  }, [setValue, wallet]);

  const onSubmit = async (data: z.infer<typeof nominateNewOwnerArgsSchema>) => {
    if (!provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    nominateNewOwnerMutation.mutate({ formData: data, provider, sdkClient });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} flexDirection="column">
        {nominateNewOwnerMutation.error && (
          <Typography color="error">Error: {nominateNewOwnerMutation.error.message}</Typography>
        )}
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="user-address">New Owner Address</FormLabel>
          <TextField
            label=">New Owner Address"
            placeholder="Address"
            {...register('args.newOwnerPublicKey', { required: true })}
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

export default NewOwnerNomination;
