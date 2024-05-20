import dotenv from 'dotenv';
dotenv.config();

export const SOLANA_RPC = process.env.SOLANA_RPC_URL || '';
