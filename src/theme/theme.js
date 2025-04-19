import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#e6f4fb',
    },
    primary: {
      main: '#3498db',
    },
    staff: {
      main: '#f1c40f',
      dark: '#d4ac0d',
      contrastText: '#ffffff',
    },
    user: {
      main: '#3498db',
      dark: '#2980b9',
      contrastText: '#ffffff',
    },
    booking: {
      main: '#ffbc37',
      button: '#f5b637',
      buttonHover: '#eba834',
    },
  },
});

export default theme;
