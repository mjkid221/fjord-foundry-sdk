import { GetContractManagerAddressResponse } from '@fjord-foundry/solana-sdk-client';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const ContractManager = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['contract-manager', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<GetContractManagerAddressResponse>('/api/read/manager-address', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Contract Arguments</Typography>
      {data ? <Typography>{data}</Typography> : <Typography>Loading...</Typography>}
    </>
  );
};

export default ContractManager;
