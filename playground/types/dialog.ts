import { ReactNode } from 'react';

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  isError?: boolean;
  errorMessage?: string;
  children?: ReactNode;
}
