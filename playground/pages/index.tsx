import { GetContractArgsResponse } from '@fjord-foundry/solana-sdk-client';
import { Container } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Home = () => {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      const { data } = await axios.get<GetContractArgsResponse>('/api/get-args');
      return data;
    },
  });

  console.log(data);
  return (
    <Container maxWidth="md">
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
                  <TableCell align="right">{value.toString()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Home;
