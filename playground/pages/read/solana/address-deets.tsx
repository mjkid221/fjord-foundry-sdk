import { Button, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useSDK } from '@/context/WalletContext';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const AddressDeets = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['contract-args', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<any>('/api/read/solana/read-address', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });

  console.log(data);

  const { connectWallet } = useSDK();

  const handleConnectClick = async () => {
    await connectWallet();
  };

  return (
    <>
      <Typography variant="h4">Address Deets</Typography>
      <Button onClick={handleConnectClick} variant="contained">
        Click me
      </Button>
    </>
  );
};

export default AddressDeets;
