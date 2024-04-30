import { SimpleDialogProps } from '@/types';
import { Container, Dialog, DialogTitle, Typography } from '@mui/material';

const FeedbackDialog = ({ onClose, open, isError = false, errorMessage, children }: SimpleDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{isError ? 'Error' : 'Success'}</DialogTitle>
      <Container style={{ paddingBottom: '20px' }}>
        {isError && <Typography>{errorMessage}</Typography>}
        {children}
      </Container>
    </Dialog>
  );
};

export default FeedbackDialog;
