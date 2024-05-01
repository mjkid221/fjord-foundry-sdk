import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { hoursToSeconds } from 'date-fns';

const TIME_OFFSET = 1_000;
const ONE_DAY_SECONDS = hoursToSeconds(24);
const PERCENTAGE_BASIS_POINTS = 100;

const DEFAULT_SALE_START_TIME_BN = new BN(new Date().getTime() / 1000 + TIME_OFFSET);

const DEFAULT_SALE_END_TIME_BN = DEFAULT_SALE_START_TIME_BN.add(new BN(ONE_DAY_SECONDS));

const DEFAULT_VESTING_CLIFF_BN = DEFAULT_SALE_END_TIME_BN.add(new BN(ONE_DAY_SECONDS));

const DEFAULT_VESTING_END_BN = DEFAULT_VESTING_CLIFF_BN.add(new BN(ONE_DAY_SECONDS));

const DEFAULT_PROGRAM_ADDRESS = new PublicKey('HK6KFuWu9ZzEaiKy16LDcaQ2u1G1NAhib7pvNxzA3jKr');
/**
 * !NOTE For testing
 */
const testMerkleWhitelistedAddresses = [
  'BDw9cp6JDBjeih6HsFwFjj2hyHb2dtkAuu6kmUGzt8v2',
  'Fzx2MEY6fuwjoL1g4Mh5D6dcxp24HEcdZ1QsrVxE5sfs',
  'b9okb7Hi6hSGwr9whszoANGNq6RCBTP94EPRd5hT3Db',
  '3choFgYsyo5gvMVJvqYNPa1CGrc1q5puAu8f6juRnRZw',
];

// Mock wallet for AnchorProvider as we are only reading data
const MOCK_WALLET = {
  publicKey: new PublicKey('7CGSCbMr3J9XH8tVcuzzw32G5BZm3cXPKaXVmTnY646r'), // This public key is a burner wallet. It is the governing devnet program owner.
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
};

const TOKEN_A = new PublicKey('GZD7PARxHsuViaqGFX5sAtu6stLioyYckg91U6CwAHut'); // This is a test token mint
const TOKEN_B = new PublicKey('AiWtsNnAzUiRRzzwjN55nPeZhrzMbnyZqx6icsnFBUBw'); // This is a test token mint

const TEST_POOL_PDA = new PublicKey('3kT4sQu1UcpvsFZkenCz894UZK9mF3jqrdaRsA1hgZ6d'); // This is the precalculated pool PDA for the test pool

const BUY_SELL_POOL_PDA = new PublicKey('36GY5QvWNzFPtiZmY5axcfDSnQymTgn66Z3hUThGZyJA'); // This is the PDA of a deployed pool using TOKEN_A and TOKEN_B

export {
  TIME_OFFSET,
  ONE_DAY_SECONDS,
  PERCENTAGE_BASIS_POINTS,
  DEFAULT_SALE_START_TIME_BN,
  DEFAULT_SALE_END_TIME_BN,
  DEFAULT_VESTING_CLIFF_BN,
  DEFAULT_VESTING_END_BN,
  testMerkleWhitelistedAddresses,
  DEFAULT_PROGRAM_ADDRESS,
  MOCK_WALLET,
  TOKEN_A,
  TOKEN_B,
  TEST_POOL_PDA,
  BUY_SELL_POOL_PDA,
};
