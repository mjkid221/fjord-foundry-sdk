import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose, handleDialogOpen, nominateNewOwner, signAndSendSwapTransaction } from '@/helpers';
import { nominateNewOwnerArgsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, TextField, Button, Typography } from '@mui/material';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const NewOwnerNomination = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

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
    <>
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
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={nominateNewOwnerMutation.error?.message ?? 'Could not nominate new owner'}
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

export default NewOwnerNomination;
