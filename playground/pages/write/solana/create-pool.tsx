import { Typography } from '@mui/material';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import CreateLbp from '@/components/write-methods/CreateLbp';
import { SolanaSdkClientProvider } from '@/context/SolanaSdkClientProvider';

const CreatePool = () => {
  return (
    <SolanaSdkClientProvider solanaNetwork={WalletAdapterNetwork.Devnet}>
      <Typography variant="h1">Create Pool Placeholder</Typography>
      <CreateLbp />
    </SolanaSdkClientProvider>
  );
};

export default CreatePool;
