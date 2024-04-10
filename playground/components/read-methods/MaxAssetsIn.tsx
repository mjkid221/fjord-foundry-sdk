import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const MaxAssetsIn = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['max-assets-in', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<string>('/api/read/evm/max-assets-in', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Max Assets In</Typography>
      {data ? <Typography>{data}</Typography> : <Typography>Loading...</Typography>}
    </>
  );
};

export default MaxAssetsIn;
