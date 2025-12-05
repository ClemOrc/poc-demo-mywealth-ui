import { createTheme } from '@mui/material/styles';
import { COLORS } from '../constants';

// Extend Material-UI theme with custom colors
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      backgroundGray: string;
      backgroundLight: string;
      borderGray: string;
      textSecondary: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      backgroundGray?: string;
      backgroundLight?: string;
      borderGray?: string;
      textSecondary?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.PRIMARY,        // BNC Red
      light: COLORS.PRIMARY_LIGHT,  // Lighter red
      dark: COLORS.PRIMARY_DARK,    // Darker red
      contrastText: COLORS.WHITE,
    },
    secondary: {
      main: COLORS.GREY_600,        // Medium grey
      light: COLORS.GREY_400,       // Light grey
      dark: COLORS.GREY_800,        // Dark grey
      contrastText: COLORS.WHITE,
    },
    background: {
      default: COLORS.BACKGROUND_GRAY,  // Light grey background
      paper: COLORS.WHITE,              // White for cards and papers
    },
    text: {
      primary: COLORS.TEXT_DARK,        // Dark grey for primary text
      secondary: COLORS.TEXT_SECONDARY, // Medium grey for secondary text
    },
    success: {
      main: COLORS.SUCCESS,  // Grey for success (neutral in BNC scheme)
    },
    warning: {
      main: COLORS.WARNING,  // Light red for warnings
    },
    error: {
      main: COLORS.ERROR,    // Red for errors
    },
    custom: {
      backgroundGray: COLORS.BACKGROUND_GRAY,
      backgroundLight: COLORS.BACKGROUND_LIGHT,
      borderGray: COLORS.BORDER_GRAY,
      textSecondary: COLORS.TEXT_SECONDARY,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: COLORS.TEXT_DARK,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: COLORS.TEXT_DARK,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: COLORS.TEXT_DARK,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: COLORS.TEXT_DARK,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: COLORS.TEXT_DARK,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: COLORS.TEXT_DARK,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
        contained: {
          backgroundColor: COLORS.PRIMARY,
          color: COLORS.WHITE,
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: COLORS.WHITE,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.PRIMARY,
          color: COLORS.WHITE,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: COLORS.PRIMARY,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: COLORS.PRIMARY,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});