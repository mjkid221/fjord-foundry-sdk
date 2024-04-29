import WalletNotConnected from '@/components/WalletNotConnected';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { setNewTreasuryFeeRecipients, signAndSendSwapTransaction } from '@/helpers';
import { setTreasuryFeeRecipientsParamsSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, FormControl, FormLabel, TextField, Typography, Button } from '@mui/material';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const SetTreasury = () => {
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
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
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
  );
};

export default SetTreasury;
