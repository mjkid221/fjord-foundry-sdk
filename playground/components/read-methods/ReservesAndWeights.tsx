import { GetReservesAndWeightsResponse } from '@fjord-foundry/solana-sdk-client';
import { Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const ReservesAndWeights = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);
  const { data } = useQuery({
    queryKey: ['reserves-weights', poolAddress],
    queryFn: async () => {
      const { data } = await axios.get<GetReservesAndWeightsResponse>('/api/read/evm/reserves-weights', {
        params: { contractAddress: poolAddress },
      });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });
  return (
    <>
      <Typography variant="h3">Contract Reserves and Weights</Typography>
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

export default ReservesAndWeights;
