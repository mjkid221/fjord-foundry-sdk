import { GetVestingStateResponse } from '@fjord-foundry/solana-sdk-client';
import { Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const VestingState = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['vesting-state', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<GetVestingStateResponse>('/api/read/evm/vesting-state', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });

  return (
    <>
      <Typography variant="h3">Vesting State</Typography>
      {data ? (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell align="center">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                Object.entries(data).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row">
                      {key.toUpperCase()}
                    </TableCell>
                    <TableCell align="right">{value.toString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </>
  );
};

export default VestingState;
