import { BN } from '@project-serum/anchor';
import { hoursToSeconds } from 'date-fns';

export const TIME_OFFSET = 1_000; // 1000 seconds

export const ONE_DAY_SECONDS = hoursToSeconds(24); // 24 hours in seconds

export const PERCENTAGE_BASIS_POINTS = 100;

export const DEFAULT_SALE_START_TIME_BN = new BN(new Date().getTime() / 1000 + TIME_OFFSET);

export const DEFAULT_SALE_END_TIME_BN = DEFAULT_SALE_START_TIME_BN.add(new BN(ONE_DAY_SECONDS));

export const INITIALIZE_LBP_ADDRESS = 'CDxtUkuCvKHVPbFwBjUuiKc5D7eKx8xPcXzmPgCHQWJW'; // This is the address of the Solana program that we are interacting with. This should be updated when the program is deployed to a different address.
