import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  Input,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const PoolAddress = () => {
  // Local state to handle the input value
  const [inputValue, setInputValue] = useState('');
  const setPoolAddress = usePoolAddressStore((state) => state.setPoolAddress);
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  // This function is called when the button is clicked
  const handleSave = () => {
    setPoolAddress(inputValue); // Update the global state with the input value
  };

  return (
    <>
      <Stack sx={{ gap: '15px' }} paddingBottom="30px">
        <Typography variant="h4">Current active pool</Typography>
        <Typography>{poolAddress.length > 0 ? poolAddress : 'Not Set'}</Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4">Set Active Pool</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl sx={{ gap: '15px' }} fullWidth>
              <InputLabel htmlFor="first">Pool Address</InputLabel>
              <Input id="poolAddress" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <Button onClick={handleSave} variant="contained">
                Set Pool Address
              </Button>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </>
  );
};

export default PoolAddress;
