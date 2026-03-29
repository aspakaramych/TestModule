import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: alpha('#cbd5e1', 0.12),
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h1: { fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '2rem', fontWeight: 700 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1.1rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    ...Array(20).fill('0 25px 50px -12px rgb(0 0 0 / 0.25)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#334155', borderRadius: '4px' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': { transform: 'scale(0.96)' },
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgb(16 185 129 / 0.3)',
          '&:hover': { boxShadow: '0 10px 15px -3px rgb(16 185 129 / 0.4)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e293b',
          border: '1px solid ' + alpha('#cbd5e1', 0.08),
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid ' + alpha('#cbd5e1', 0.05),
          padding: '16px',
        },
        head: {
          color: '#94a3b8',
          fontWeight: 600,
          backgroundColor: alpha('#0f172a', 0.2),
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: alpha('#10b981', 0.08),
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            backgroundColor: alpha('#0f172a', 0.3),
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#10b981', 0.5) },
          },
        },
      },
    },
  },
});

export default theme;
