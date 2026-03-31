// src/contexts/ThemeProvider.js
import React, { useState, useMemo } from 'react';
import { ThemeContext } from './themeContext';
import { themes } from '../../constants/Themes';

export const ThemeProvider = ({ children }) => {
  // State to hold the current theme key
  const [themeKey, setThemeKey] = useState('deep-space');

  // Function to change the theme
  const toggleTheme = (key) => {
    setThemeKey(key);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      theme: themes[themeKey], // The actual theme object
      toggleTheme: toggleTheme, // The function to change it
    }),
    [themeKey]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};