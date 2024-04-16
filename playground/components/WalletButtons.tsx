import { Stack } from '@mui/material';
import dynamic from 'next/dynamic';
const WalletDisconnectButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
  { ssr: false },
);
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false },
);

const WalletButtons = () => {
  return (
    <Stack direction="row" spacing={2} margin={3} justifyContent="flex-end">
      <WalletMultiButtonDynamic />
      <WalletDisconnectButtonDynamic />
    </Stack>
  );
};

export default WalletButtons;
