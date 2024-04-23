import { Typography } from '@mui/material';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import CreateLbp from '@/components/write-methods/initialization/CreateLbp';
import { SolanaSdkClientProvider } from '@/context/SolanaSdkClientProvider';

const CreatePool = () => {
  return (
    <SolanaSdkClientProvider solanaNetwork={WalletAdapterNetwork.Devnet}>
      <Typography variant="h3">Create LBP</Typography>
      <CreateLbp />
    </SolanaSdkClientProvider>
  );
};

export default CreatePool;
