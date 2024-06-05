import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { PoolDataValueKey } from '../enums';
/**
 * Options for the Solana client.
 * @typedef {Object} SolanaClientOptions
 * @property {WalletAdapterNetwork} solanaNetwork - The Solana network to connect to.
 * @property {string} rpcUrl - The RPC URL of the Solana network.
 * @property {PublicKey} programId - The program ID of the LBP.
 * @property {boolean} [enableLogging] - Enable logging for the client.
 */
export interface SolanaClientOptions {
  solanaNetwork: WalletAdapterNetwork;
  rpcUrl?: string;
  programId: PublicKey;
  enableLogging?: boolean;
}

export interface RetrievePoolDataParams {
  poolPda: PublicKey;
}

export interface RetrieveSinglePoolDataValueParams extends RetrievePoolDataParams {
  valueKey: PoolDataValueKey;
}
