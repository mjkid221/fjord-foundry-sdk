import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';
import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import {
  handleDialogClose,
  handleDialogOpen,
  setNewTreasuryFeeRecipients,
  signAndSendSwapTransaction,
} from '@/helpers';
import { setTreasuryFeeRecipientsParamsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, TextField, Typography, Button } from '@mui/material';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const SetTreasury = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const [recipientAddresses, setRecipientAddresses] = useState<{ feeRecipient: string; feePercentage: string }[]>([]);
  const [newAddress, setNewAddress] = useState<{ feeRecipient: string; feePercentage: string }>({
    feeRecipient: '',
    feePercentage: '',
  });
  const { handleSubmit, setValue, register } = useForm<z.infer<typeof setTreasuryFeeRecipientsParamsSchema>>({
    resolver: zodResolver(setTreasuryFeeRecipientsParamsSchema),
  });

  const addRecipientAddress = () => {
    setRecipientAddresses([...recipientAddresses, newAddress]);
    setNewAddress({ feeRecipient: '', feePercentage: '' });
    setValue('feeRecipients', recipientAddresses);
  };

  const removeRecipientAddress = (index: number) => {
    setRecipientAddresses(recipientAddresses.filter((_, i) => i !== index));
    setValue('feeRecipients', recipientAddresses);
  };

  const wallet = useAnchorWallet();

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  useEffect(() => {
    if (!wallet) return;
    setValue('creator', wallet.publicKey?.toBase58());
  }, [setValue, wallet]);

  const setTreasuryFeeRecipientsMutation = useMutation({
    mutationFn: setNewTreasuryFeeRecipients,
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

  const onSubmit = async (data: z.infer<typeof setTreasuryFeeRecipientsParamsSchema>) => {
    if (!provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    setTreasuryFeeRecipientsMutation.mutate({
      formData: { ...data, feeRecipients: recipientAddresses },
      provider,
      sdkClient,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} flexDirection="column">
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="swap-recipient">Swap Fee Recipient</FormLabel>
            <TextField
              label=">Swap Fee Recipient"
              placeholder="Swap Fee Recipient"
              {...register('swapFeeRecipient', { required: true })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Recipient Addresses</FormLabel>
            <TextField
              placeholder="Enter Recipient Address"
              value={newAddress.feeRecipient}
              onChange={(e) => setNewAddress({ ...newAddress, feeRecipient: e.target.value })}
            />
            <TextField
              placeholder="Enter Fee Percentage"
              value={newAddress.feePercentage}
              onChange={(e) => setNewAddress({ ...newAddress, feePercentage: e.target.value })}
            />
            <Button variant="contained" onClick={addRecipientAddress}>
              Add
            </Button>

            {/* Displays the list of added addresses */}
            <ul>
              {recipientAddresses.map((recipient, index) => (
                <li key={index}>
                  {recipient.feeRecipient} ({recipient.feePercentage})
                  <Button onClick={() => removeRecipientAddress(index)}>Remove</Button>
                </li>
              ))}
            </ul>
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
        errorMessage={setTreasuryFeeRecipientsMutation.error?.message ?? 'Could not set new treasury fee recipients'}
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

export default SetTreasury;
