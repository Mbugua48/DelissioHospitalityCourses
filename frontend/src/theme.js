import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        light: '#63a4ff',
        main: '#1565c0',
        dark: '#003c8f',
      },
      secondary: {
        main: '#ff7043',
      },
      background: {
        default: mode === 'light' ? '#f6f8fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 6,
        },
      },
    },
  });

export default getTheme;
