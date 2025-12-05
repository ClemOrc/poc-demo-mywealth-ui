import { createTheme } from '@mui/material/styles';
import { COLORS } from '../constants';

// Extend Material-UI theme with custom colors
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      backgroundGray: string;
      backgroundLight: string;
      backgroundDark: string;
      borderGray: string;
      textSecondary: string;
      textDisabled: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      backgroundGray?: string;
      backgroundLight?: string;
      backgroundDark?: string;
      borderGray?: string;
      textSecondary?: string;
      textDisabled?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.PRIMARY, // BNC Red #E31837
      light: COLORS.PRIMARY_LIGHT,
      dark: COLORS.PRIMARY_DARK,
      contrastText: COLORS.WHITE,
    },
    secondary: {
      main: '#666666', // Grey for secondary elements
      light: '#999999',
      dark: '#333333',
      contrastText: COLORS.WHITE,
    },
    background: {
      default: COLORS.BACKGROUND_GRAY,
      paper: COLORS.WHITE,
    },
    text: {
      primary: COLORS.TEXT_PRIMARY,
      secondary: COLORS.TEXT_SECONDARY,
      disabled: COLORS.TEXT_DISABLED,
    },
    success: {
      main: COLORS.SUCCESS,
    },
    warning: {
      main: COLORS.WARNING,
    },
    error: {
      main: COLORS.ERROR,
    },
    info: {
      main: COLORS.INFO,
    },
    custom: {
      backgroundGray: COLORS.BACKGROUND_GRAY,
      backgroundLight: COLORS.BACKGROUND_LIGHT,
      backgroundDark: COLORS.BACKGROUND_DARK,
      borderGray: COLORS.BORDER_GRAY,
      textSecondary: COLORS.TEXT_SECONDARY,
      textDisabled: COLORS.TEXT_DISABLED,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: COLORS.TEXT_PRIMARY,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: COLORS.TEXT_PRIMARY,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: COLORS.TEXT_PRIMARY,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: COLORS.TEXT_PRIMARY,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: COLORS.TEXT_PRIMARY,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: COLORS.TEXT_PRIMARY,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(227, 24, 55, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: COLORS.PRIMARY,
          '&:hover': {
            backgroundColor: COLORS.PRIMARY_DARK,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${COLORS.BORDER_GRAY}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.BACKGROUND_LIGHT,
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: COLORS.TEXT_PRIMARY,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        filled: {
          backgroundColor: COLORS.BACKGROUND_DARK,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: COLORS.BORDER_GRAY,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.PRIMARY,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.PRIMARY,
          },
        },
      },
    },
  },
});