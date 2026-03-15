import React, { createContext, useState, useContext } from "react";

const lightTheme = {
  background: "#ffffff",
  text: "#000000",
  card: "#f2f2f2",
};

const darkTheme = {
  background: "#121212",
  text: "#ffffff",
  card: "#1e1e1e",
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);