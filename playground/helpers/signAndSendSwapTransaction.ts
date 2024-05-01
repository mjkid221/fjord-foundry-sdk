import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, TransactionInstruction } from '@solana/web3.js';

export const signAndSendSwapTransaction = async (
  transactionInstruction: TransactionInstruction,
  wallet: AnchorWallet | undefined,
  connection: Connection,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: { minContextSlot?: number },
  ) => Promise<string>,
) => {
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

    console.log('Transaction confirmed:', confirmation);
    return { txid, confirmation };
  } catch (error) {
    console.error(error);
    throw new Error('Transaction could not be confirmed');
  }
};
