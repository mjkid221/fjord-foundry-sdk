import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolArgs } from '@/helpers/pool-initialization';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { handleDialogClose } from '@/helpers';
import FeedbackDialog from '../FeedbackDialog';

const PoolArgs = () => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in handleDialogClose but not in the component
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { sdkClient } = useContext(SolanaSdkClientContext);

  const { data, error, isError } = useQuery({
    queryKey: ['pool-args'],
    queryFn: async () => {
      if (!sdkClient) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);

      const data = await getPoolArgs({ poolPda, sdkClient });
      return data;
    },
    enabled: poolAddress !== '' && !!poolAddress,
  });

  useEffect(() => {
    if (!isError) {
      return;
    }
    setErrorDialogOpen(true);
  }, [isError]);

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
        <Typography>No active pool set.</Typography>
      )}
      <FeedbackDialog
        onClose={() => handleDialogClose({ setErrorDialogOpen, setSuccessDialogOpen })}
        open={errorDialogOpen}
        isError={true}
        errorMessage={error?.message}
      />
    </>
  );
};

export default PoolArgs;
