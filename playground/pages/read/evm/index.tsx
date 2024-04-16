import { Container } from '@mui/material';

import NavigationAccordion from '@/components/NavigationAccordion';
import { transformedFunctionsObject } from '@/constants/contract-methods';

const EvmRead = () => {
  const formattedFunctionsObject = Object.values(transformedFunctionsObject).map((value) => ({
    href: `evm/${value}`,
    label: value,
  }));
  return (
    <Container maxWidth="md" sx={{ paddingY: '30px' }}>
      <NavigationAccordion title="All EVM Methods" links={formattedFunctionsObject} />
    </Container>
  );
};

export default EvmRead;
