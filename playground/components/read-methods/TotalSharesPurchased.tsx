import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const TotalSharesPurchased = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['total-shares-purchased', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<string>('/api/read/evm/total-shares-purchased', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Total Shares Purchased</Typography>
      {data ? <Typography>{data}</Typography> : <Typography>Loading...</Typography>}
    </>
  );
};

export default TotalSharesPurchased;
