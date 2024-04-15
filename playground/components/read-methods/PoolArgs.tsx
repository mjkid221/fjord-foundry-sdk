import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolArgs } from '@/helpers/pool-initialization';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const PoolArgs = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { connection } = useConnection();

  const { provider, sdkClient } = useContext(SolanaSdkClientContext);

  const { data } = useQuery({
    queryKey: ['pool-args'],
    queryFn: async () => {
      if (!provider || !sdkClient) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolArgs({ poolPda, programId: programAddressPublicKey, provider, sdkClient, connection });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });

  return (
    <>
      <Typography>PoolArgs</Typography>
      {data ? (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Argument</TableCell>
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
                    <TableCell align="right">{value}</TableCell>
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

export default PoolArgs;
