import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const SellingAllowedStatus = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['selling-allowed-status', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<string>('/api/read/evm/selling-allowed', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Selling Allowed Status</Typography>
      {data ? <Typography>Is Selling Allowed: {data}</Typography> : <Typography>Loading...</Typography>}
    </>
  );
};

export default SellingAllowedStatus;
