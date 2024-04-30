import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { createPool } from '@/helpers/pool-initialization';
import { initializePoolArgsSchema } from '@/types';
import WalletNotConnected from '../../WalletNotConnected';
import { handleDialogClose, handleDialogOpen } from '@/helpers';
import FeedbackDialog from '@/components/FeedbackDialog';
import SuccessFeedback from '@/components/FeedbackDialog/SuccessFeedback';

const CreateLbp = () => {
  const [poolAddress, setPoolAddress] = useState<string>();
  const [saleTimeStart, setSaleTimeStart] = useState<Dayjs | null | undefined>(null);
  const [saleTimeEnd, setSaleTimeEnd] = useState<Dayjs | null | undefined>(null);
  const [isSellingAllowed, setIsSellingAllowed] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue } = useForm<z.infer<typeof initializePoolArgsSchema>>({
    resolver: zodResolver(initializePoolArgsSchema),
  });

  const signAndSendCreatePoolTransaction = async (transactionInstruction: TransactionInstruction) => {
    const transaction = new Transaction().add(transactionInstruction);

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    try {
      if (!transaction || !sendTransaction) throw new Error('Transaction not found');

      const txid = await sendTransaction(transaction, connection, { minContextSlot });

      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`);

      const confirmation = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: txid });

      return { txid, confirmation };
    } catch (error) {
      console.error(error);
    }
  };

  const createPoolMutation = useMutation({
    mutationFn: createPool,
    onSuccess: async (data) => {
      setPoolAddress(data.poolPda.toBase58());
      try {
        const confirmation = await signAndSendCreatePoolTransaction(data.transactionInstruction);
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

  const onSubmit = (data: z.infer<typeof initializePoolArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Required connetion, provider or sdkClient not found');
    }
    const formattedData = {
      args: {
        ...data.args,
        saleEndTime: saleTimeEnd?.unix().toString() as string,
        saleStartTime: saleTimeStart?.unix().toString() as string,
        sellingAllowed: isSellingAllowed,
      },
    };

    createPoolMutation.mutate({
      formData: formattedData,
      connection,
      provider,
      sdkClient,
    });
  };

  const handleIsSellingAllowedChange = (event: SelectChangeEvent<string>) => {
    setIsSellingAllowed(event.target.value === 'true');
    setValue('args.sellingAllowed', event.target.value === 'true');
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} flexDirection="column">
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="creator-address">Creator Address</FormLabel>
            <TextField
              label="creator address"
              placeholder="creator"
              {...register('args.creator', { required: true })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="shareTokenMint">Share Token Mint</FormLabel>
            <TextField label="shareTokenMint" placeholder="shareTokenMint" {...register('args.shareTokenMint')} />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="assetTokenMint">Asset Token Mint</FormLabel>
            <TextField label="assetTokenMint" placeholder="assetTokenMint" {...register('args.assetTokenMint', {})} />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="assets">Assets</FormLabel>
            <TextField label="assets" placeholder="assets" type="number" {...register('args.assets')} />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="shares">Shares</FormLabel>
            <TextField label="shares" placeholder="shares" type="number" {...register('args.shares', {})} />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="maxSharesOut">Max Shares Out</FormLabel>
            <TextField
              label="maxSharesOut"
              placeholder="maxSharesOut"
              type="number"
              {...register('args.maxSharesOut', {})}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="maxSharePrice">Max Share Price</FormLabel>
            <TextField
              label="maxSharePrice"
              placeholder="maxSharePrice"
              type="number"
              {...register('args.maxSharePrice', {})}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="maxAssetsIn">Max Assets In</FormLabel>
            <TextField
              label="maxAssetsIn"
              placeholder="maxAssetsIn"
              type="number"
              {...register('args.maxAssetsIn', {})}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="startWeightBasisPoints">Start Weight Basis Points</FormLabel>
            <TextField
              label="startWeightBasisPoints"
              placeholder="startWeightBasisPoints"
              {...register('args.startWeightBasisPoints', {})}
              type="number"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="endWeightBasisPoints">End Weight Basis Points</FormLabel>
            <TextField
              label="endWeightBasisPoints"
              placeholder="endWeightBasisPoints"
              {...register('args.endWeightBasisPoints', {})}
              type="number"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="saleTimeStart">Sale Time Start</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Sale Time Start"
                value={saleTimeStart}
                onChange={(newValue) => {
                  setSaleTimeStart(newValue);
                  setValue('args.saleStartTime', newValue?.unix().toString() as string);
                }}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="saleTimeEnd">Sale Time End</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Sale Time End"
                value={saleTimeEnd}
                onChange={(newValue) => {
                  setSaleTimeEnd(newValue);
                  setValue('args.saleEndTime', newValue?.unix().toString() as string);
                }}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel htmlFor="isSellingAllowed">Is Selling Allowed</FormLabel>
            <Select
              value={isSellingAllowed ? 'true' : 'false'}
              label="Selling Allowed"
              onChange={handleIsSellingAllowedChange}
              defaultValue={'false'}
            >
              <MenuItem value="false">False</MenuItem>
              <MenuItem value="true">True</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" type="submit" disabled={!wallet}>
            Submit
          </Button>
          {!wallet && <WalletNotConnected />}
          {poolAddress && <Typography>Newly created pool address: {poolAddress}</Typography>}
        </Stack>
      </form>
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={createPoolMutation.error?.message ?? "Couldn't create pool"}
      />
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={successDialogOpen}
      >
        <SuccessFeedback transactionHash={transactionHash} newPoolPda={poolAddress} />
      </FeedbackDialog>
    </>
  );
};

export default CreateLbp;
