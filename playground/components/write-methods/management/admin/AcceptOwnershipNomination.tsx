import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { acceptOwnershipNomination, signAndSendSwapTransaction } from '@/helpers';
import { acceptOwnershipParamsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, Button, Typography } from '@mui/material';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const AcceptOwnershipNomination = () => {
  const { handleSubmit, setValue } = useForm<z.infer<typeof acceptOwnershipParamsSchema>>({
    resolver: zodResolver(acceptOwnershipParamsSchema),
  });

  const wallet = useAnchorWallet();

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const acceptOwnershipMutation = useMutation({
    mutationFn: acceptOwnershipNomination,
    onSuccess: async (data) => {
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
  });

  useEffect(() => {
    if (!wallet) return;
    setValue('args.newOwnerPublicKey', wallet.publicKey?.toBase58());
  }, [setValue, wallet]);

  const onSubmit = async (data: z.infer<typeof acceptOwnershipParamsSchema>) => {
    if (!provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    acceptOwnershipMutation.mutate({ formData: data, provider, sdkClient });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} flexDirection="column">
        <FormControl sx={{ mb: 2 }}>
          <FormLabel htmlFor="user-address">New Owner Address</FormLabel>
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

export default AcceptOwnershipNomination;
