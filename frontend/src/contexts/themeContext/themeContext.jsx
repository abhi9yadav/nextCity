// src/contexts/ThemeContext.js
import { createContext } from 'react';
import { themes } from '../../constants/Themes'; // Your theme object

// Create a context with a default value
export const ThemeContext = createContext({
  theme: themes['deep-space'], // Default theme
  toggleTheme: () => {}, // Placeholder function
});