import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a ThemeContext to provide theme state and updater function
const ThemeContext = createContext();

// Custom hook to use the ThemeContext
export const useTheme = () => {
  return useContext(ThemeContext);
};

// ThemeProvider component to wrap the application and provide theme state
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get the initial theme from localStorage or default to light
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Update the document body class based on the theme
    document.body.className = theme;
    // Persist the theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};