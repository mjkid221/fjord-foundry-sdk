import { Link, Stack, Typography } from '@mui/material';

interface SuccessFeedbackProps {
  transactionHash: string;
  newPoolPda?: string;
}

const SuccessFeedback = ({ transactionHash, newPoolPda }: SuccessFeedbackProps) => {
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
          href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`}
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
