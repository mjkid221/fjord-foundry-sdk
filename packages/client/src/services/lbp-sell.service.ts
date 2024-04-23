import * as anchor from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';

import { Logger, LoggerLike } from './logger.service';

export class LbpSellService {
  private provider: anchor.Provider;

  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private network: WalletAdapterNetwork;

  private logger: LoggerLike;

  constructor(programId: PublicKey, provider: anchor.AnchorProvider, network: WalletAdapterNetwork) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.network = network;
    this.logger = Logger('LbpBuyService', true);
    this.logger.debug('LbpBuyService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpSellService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {WalletAdapterNetwork} network - The Solana network to use.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpSellService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
  ): Promise<LbpSellService> {
    const service = await Promise.resolve(new LbpSellService(programId, provider, network));

    return service;
  }

  // public async createSwapExactSharesForAssetsInstruction({}): Promise<TransactionInstruction> {}
}
