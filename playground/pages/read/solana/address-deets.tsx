import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
  return <Typography variant="h4">Address Deets</Typography>;
};

export default AddressDeets;
