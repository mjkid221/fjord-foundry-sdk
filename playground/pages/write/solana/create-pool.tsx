import { Button, Typography } from '@mui/material';

import CreateLbp from '@/components/write-methods/CreateLbp';
import { useEffect } from 'react';
import { useSDK } from '@/context/WalletContext';
import { AnchorProvider } from '@project-serum/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

const CreatePool = () => {
  return (
    <>
      <Typography variant="h1">Create Pool Placeholder</Typography>
      <CreateLbp />
    </>
  );
};

export default CreatePool;
