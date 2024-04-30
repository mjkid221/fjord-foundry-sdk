import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { handleDialogClose, handleDialogOpen, setNewPoolFees, signAndSendSwapTransaction } from '@/helpers';
import { newFeesSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, Typography, Button, TextField } from '@mui/material';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const NewPoolFees = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

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

  const onSubmit = async (data: z.infer<typeof newFeesSchema>) => {
    if (!provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    setNewPoolFeesMutation.mutate({ formData: data, provider, sdkClient });
  };

  return (
    <>
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
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={setNewPoolFeesMutation.error?.message ?? 'Could not set new pool fees'}
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

export default NewPoolFees;
