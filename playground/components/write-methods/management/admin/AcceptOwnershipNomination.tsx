import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { acceptOwnershipNomination, handleDialogClose, handleDialogOpen, signAndSendSwapTransaction } from '@/helpers';
import { acceptOwnershipParamsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, Button, Typography } from '@mui/material';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const AcceptOwnershipNomination = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

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
    <>
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
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={acceptOwnershipMutation.error?.message ?? "Couldn't accept ownership nomination"}
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

export default AcceptOwnershipNomination;
