import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createPublicClient } from 'viem';

import { InitializePoolParams } from './lbp-initialization';

export interface PublicClientServiceInterface {
  /**
   * This method returns the public client instance. TODO: This will be refactored to use Solana requirements.
   * @returns {ReturnType<typeof createPublicClient>} The public client instance.
   */
  getPublicClient?(): ReturnType<typeof createPublicClient>;
}

export interface SolanaConnectionServiceInterface {
  /**
   * Gets the Solana connection object.
   * @returns {Connection} - The Solana connection object.
   */
  getConnection?(): Connection;

  /**
   * Gets the connected wallet.
   * @returns {PhantomWalletAdapter | null} - The connected wallet, or null if no wallet is connected.
   */
  getConnectedWallet?(): Promise<PhantomWalletAdapter | null>;

  /**
   * Connects the wallet to the specified network.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @returns {Promise<PublicKey | null>} - A promise that resolves with the public key of the connected wallet, or null if connection fails.
   */
  connectWallet?(network: WalletAdapterNetwork): Promise<PublicKey | null>;

  /**
   * Signs a transaction using the connected wallet.
   * @param {Transaction} transaction - The transaction to be signed.
   * @returns {Promise<Transaction | null>} - A promise that resolves with the signed transaction, or null if signing fails.
   */
  signTransaction?(transaction: Transaction): Promise<Transaction | null>;
}

export interface ClientService extends PublicClientServiceInterface, SolanaConnectionServiceInterface {}

export interface LbpInitializationServiceInterface {
  /**
   * Initializes a liquidity bootstrapping pool (LBP) with the provided parameters.
   * @param {InitializePoolParams} options - The options for initializing the pool.
   * @param {InitializePoolPublicKeys} options.keys - The keys required for initializing the pool.
   * @param {InitializePoolArgs} options.args - The arguments for initializing the pool.
   * @returns {Promise<{ pool: any, events: any[] }>} - A promise that resolves with the initialized pool and events.
   *
   * @example
   * ```typescript
   * const keys = {
   *  creator: creatorWallet.publicKey,
   *  shareTokenMint: shareTokenMint.publicKey,
   *  assetTokenMint: assetTokenMint.publicKey,
   * };
   *
   * const args = {
   *  assets: [assetTokenMint.publicKey],
   *  shares: [shareTokenMint.publicKey],
   *  virtualAssets: [assetTokenMint.publicKey],
   *  virtualShares: [shareTokenMint.publicKey],
   *  maxSharePrice: 100,
   *  maxSharesOut: 100,
   *  maxAssetsIn: 100,
   *  startWeightBasisPoints: 1000,
   *  endWeightBasisPoints: 1000,
   *  saleStartTime: 0,
   *  saleEndTime: 0,
   *  vestCliff: 0,
   *  vestEnd: 0,
   *  whitelistMerkleRoot: new anchor.web3.PublicKey(''),
   *  sellingAllowed: true,
   * };
   *
   * const { pool, events } = await lbpInitializationService.initializePool({ keys, args });
   * ```
   */
  initializePool({ keys, args }: InitializePoolParams): Promise<{ pool: any; events: any[] }>;
}
