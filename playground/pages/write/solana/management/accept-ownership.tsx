import AcceptOwnershipNomination from '@/components/write-methods/management/admin/AcceptOwnershipNomination';
import { Typography } from '@mui/material';

const AcceptOwnership = () => {
  return (
    <>
      <Typography variant="h4">Accept Ownership Confirmation</Typography>
      <AcceptOwnershipNomination />
    </>
  );
};

export default AcceptOwnership;
