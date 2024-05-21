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

const DEFAULT_PROGRAM_ADDRESS = new PublicKey('7UTvQUzE1iThaXhXDg1FsVoqcv3MBAgwUCW7PEKzNbPH');
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
  publicKey: new PublicKey('AMT6SgVe6qyyeapGBy5bCJaiqjjrDTVEU9zY8VfZSKjo'), // This public key is a burner wallet. It is the governing devnet program owner.
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
};

const TOKEN_A = new PublicKey('HLLuFQ4og2dJJmZomqz3GE1j33TqrVZH9eR5Zc5ZzHGe'); // This is a test token mint
const TOKEN_B = new PublicKey('GAyiPxvqhQ8DekQYKcv3RKANDYkJFdhWVBiiENTXPFh9'); // This is a test token mint

const TEST_POOL_PDA = new PublicKey('3kT4sQu1UcpvsFZkenCz894UZK9mF3jqrdaRsA1hgZ6d'); // This is the precalculated pool PDA for the test pool

const BUY_SELL_POOL_PDA = new PublicKey('ENkSSP1KL5F186aCPbXWKEoSq4PinYX4HdkbUzTtbayM'); // This is the PDA of a deployed pool using TOKEN_A and TOKEN_B

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
