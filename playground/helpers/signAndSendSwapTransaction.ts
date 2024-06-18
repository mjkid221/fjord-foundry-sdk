import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ComputeBudgetProgram, Connection, Transaction, TransactionInstruction } from '@solana/web3.js';
import { max } from 'lodash';
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
  const transaction = new Transaction().add(transactionInstruction).add(
    // Adds the prioritization fee to the transaction
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: await getPriorityFeeEstimate(connection, transactionInstruction),
    }),
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
    throw new Error('Transaction could not be confirmed');
  }
};

/**
 * Gets the maximum prioritization fee compile from the last 150 blocks based on provided transaction accounts
 * @param connection The connection to use
 * @param transaction The transaction to get the prioritization fee estimate for
 * @returns The maximum prioritization fee estimate
 * @throws If the prioritization fee estimate fails, returns 0
 */
export async function getPriorityFeeEstimate(connection: Connection, transaction: TransactionInstruction) {
  try {
    const prioritizationFees = await connection.getRecentPrioritizationFees({
      lockedWritableAccounts: transaction.keys.filter((key) => key.isWritable).map((key) => key.pubkey),
    });
    // Get the maximum prioritization fee
    return max(prioritizationFees.map((fee) => fee.prioritizationFee)) ?? 0;
  } catch {
    // Failsafe to 0 (this will ignore prioritization and fallback to base fee)
    return 0;
  }
}
