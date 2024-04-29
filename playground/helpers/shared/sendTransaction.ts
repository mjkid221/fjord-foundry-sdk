import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, TransactionInstruction } from '@solana/web3.js';

/**
 * Sign and send a transaction
 * @param transactionInstructions - Either a single or multiple transaction instructions
 * @param wallet - Anchor wallet instance
 * @param connection - Solana connection provider
 * @param sendTransaction - From the wallet adapter
 */
export const signAndSendTransaction = async (
  transactionInstructions: TransactionInstruction[] | TransactionInstruction,
  wallet: AnchorWallet | undefined,
  connection: Connection,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: { minContextSlot?: number },
  ) => Promise<string>,
) => {
  const transaction = new Transaction().add(
    ...(Array.isArray(transactionInstructions) ? transactionInstructions : [transactionInstructions]),
  );

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
  }
};
