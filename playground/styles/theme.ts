import { deepPurple, teal, red, orange, green } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { Roboto, Montserrat } from 'next/font/google';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const montserrat = Montserrat({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: deepPurple[700],
    },
    secondary: {
      main: teal[500],
      light: teal[300],
      dark: teal[700],
    },
    error: {
      main: red[500],
    },
    warning: {
      main: orange[500],
    },
    success: {
      main: green[500],
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontFamily: montserrat.style.fontFamily,
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontFamily: montserrat.style.fontFamily,
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontFamily: montserrat.style.fontFamily,
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h4: {
      fontFamily: montserrat.style.fontFamily,
      fontWeight: 500,
      fontSize: '1.2rem',
    },
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          justifyContent: 'flex-start',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '12px 16px',
        },
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            background: deepPurple[700],
            color: 'white',
            '&:hover': {
              backgroundColor: deepPurple[900],
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            border: `1px solid ${deepPurple[700]}`,
            color: deepPurple[700],
            '&:hover': {
              backgroundColor: deepPurple[100],
            },
          },
        },
      ],
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: '1px solid #E0E0E0',
        },
      },
    },
  },
});

export default theme;
