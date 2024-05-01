import { SetStateAction } from 'react';

type HandleDialogParams = {
  setErrorDialogOpen: (value: SetStateAction<boolean>) => void;
  setSuccessDialogOpen: (value: SetStateAction<boolean>) => void;
  isError?: boolean;
};

export const handleDialogOpen = ({ setErrorDialogOpen, setSuccessDialogOpen, isError = false }: HandleDialogParams) => {
  if (isError) {
    setErrorDialogOpen(true);
  } else {
    setSuccessDialogOpen(true);
  }
};

export const handleDialogClose = ({ setErrorDialogOpen, setSuccessDialogOpen }: HandleDialogParams) => {
  setErrorDialogOpen(false);
  setSuccessDialogOpen(false);
};
