import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ColorModeContext = createContext({ toggleColorMode: () => { } });

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => {
                const newMode = prevMode === 'light' ? 'dark' : 'light';
                localStorage.setItem('themeMode', newMode);
                return newMode;
            });
        },
    }), []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: {
                main: '#2563eb',
                light: '#3b82f6',
                dark: '#1d4ed8',
            },
            background: {
                default: mode === 'light' ? '#f8fbff' : '#0f172a',
                paper: mode === 'light' ? '#ffffff' : '#1e293b',
                subtle: mode === 'light' ? '#fcfdff' : '#1e293b',
            },
            text: {
                primary: mode === 'light' ? '#0f172a' : '#f8fafc',
                secondary: mode === 'light' ? '#64748b' : '#94a3b8',
            },
        },
        shape: {
            borderRadius: 16,
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '12px',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: mode === 'light'
                            ? '0 4px 20px rgba(0,0,0,0.05)'
                            : '0 4px 20px rgba(0,0,0,0.4)',
                        backgroundImage: 'none',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    }), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
