import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const PoolClosedStatus = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['pool-closed-status', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<string>('/api/read/pool-closed', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Pool Closed Status</Typography>
      {data ? <Typography>Is Pool Closed: {data}</Typography> : <Typography>Loading...</Typography>}
    </>
  );
};

export default PoolClosedStatus;
