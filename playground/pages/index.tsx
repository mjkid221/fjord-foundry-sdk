import { Container, Stack } from '@mui/material';
import Link from 'next/link';

import { transformedFunctionsObject } from '@/constants/contract-methods';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        {/* {READ_FUNCTIONS.map((func) => (
          <Link key={func} href={'#'}>
            {func}
          </Link>
        ))} */}
        {Object.entries(transformedFunctionsObject).map((func) => (
          <Link key={func[0]} href={`read/${func[1]}`}>
            {func[0]}
          </Link>
        ))}
      </Stack>
    </Container>
  );
};

export default Home;
