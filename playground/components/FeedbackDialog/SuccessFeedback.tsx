import { useSolanaNetworkStore } from '@/stores/useSolanaNetworkStore';
import { Link, Stack, Typography } from '@mui/material';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

interface SuccessFeedbackProps {
  transactionHash: string;
  newPoolPda?: string;
}

const SuccessFeedback = ({ transactionHash, newPoolPda }: SuccessFeedbackProps) => {
  const solanaNetwork = useSolanaNetworkStore((state) => state.solanaNetwork);
  return (
    <Stack spacing={4}>
      {newPoolPda && (
        <Stack>
          <Typography variant="h4">Here is your new LBP PDA</Typography>
          <Typography>{newPoolPda}</Typography>
        </Stack>
      )}
      <Stack>
        <Link
          href={`https://explorer.solana.com/tx/${transactionHash}${solanaNetwork === WalletAdapterNetwork.Devnet && '?cluster=devnet'}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Typography variant="h4">View your transaction</Typography>
        </Link>
      </Stack>
    </Stack>
  );
};

export default SuccessFeedback;
