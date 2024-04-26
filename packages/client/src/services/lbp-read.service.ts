import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Connection } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { GetPoolFeesResponse } from '../types';

import { Logger, LoggerLike } from './logger.service';

export class LbpReadService {
  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private connection: Connection;

  private network: WalletAdapterNetwork;

  private logger: LoggerLike;

  constructor(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ) {
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl(network));
    this.network = network;
    this.logger = Logger('LbpManagementService', loggerEnabled);
    this.logger.debug('LbpManagementService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpManagementService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {anchor.AnchorProvider} provider - The Anchor provider object.
   * @param {WalletAdapterNetwork} network - The Solana network.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpManagementService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ): Promise<LbpReadService> {
    const service = await Promise.resolve(new LbpReadService(programId, provider, network, loggerEnabled));

    return service;
  }

  private async getOwnerConfig() {
    // Get the program address for the owner config
    const [configPda] = findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

    // Get the owner config
    const ownerConfig = await this.program.account.ownerConfig.fetch(configPda);

    return ownerConfig;
  }

  private async getTreasuryAccount() {
    // Get the treasury PDA
    const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], this.program.programId);

    const treasuryAccount = await this.program.account.treasury.fetch(treasuryPda);

    return treasuryAccount;
  }

  public async getPoolFees(): Promise<GetPoolFeesResponse> {
    // Get the owner config
    const ownerConfig = await this.getOwnerConfig();

    // Destructure the owner config fees
    const { platformFee, referralFee, swapFee } = ownerConfig;

    const formattedFees = {
      // Convert fees to percentage
      platformFee: platformFee / 100,
      referralFee: referralFee / 100,
      swapFee: swapFee / 100,
    };

    return {
      ...formattedFees,
    };
  }

  public async getPoolOwner(): Promise<PublicKey> {
    // Get the owner config
    const ownerConfig = await this.getOwnerConfig();

    return ownerConfig.owner;
  }

  public async getFeeRecipients() {
    // Get the owner config
    const treasuryAccount = await this.getTreasuryAccount();

    const { feeRecipients } = treasuryAccount;

    return feeRecipients;
  }

  public async getSwapFeeRecipient(): Promise<PublicKey> {
    // Get the treasury account
    const treasuryAccount = await this.getTreasuryAccount();

    return treasuryAccount.swapFeeRecipient;
  }
}
