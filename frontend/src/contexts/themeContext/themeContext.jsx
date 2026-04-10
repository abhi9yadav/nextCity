import { createContext } from 'react';
import { themes } from '../../constants/Themes';

export const ThemeContext = createContext({
  theme: themes['bright-mode'],
  toggleTheme: () => {},
});