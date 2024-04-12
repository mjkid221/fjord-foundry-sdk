import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const MaxSharesOut = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['max-shares-out', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<string>('/api/read/max-shares-out', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Max Shares Out</Typography>
      {data ? <Typography>{data}</Typography> : <Typography>Loading...</Typography>}
    </>
  );
};

export default MaxSharesOut;
