import { Container, Stack } from '@mui/material';
import Link from 'next/link';

import { transformedFunctionsObject } from '@/constants/contract-methods';

const EvmRead = () => {
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <Stack>
        {Object.entries(transformedFunctionsObject).map((func) => (
          <Link key={func[0]} href={`evm/${func[1]}`}>
            {func[0]}
          </Link>
        ))}
      </Stack>
    </Container>
  );
};

export default EvmRead;
