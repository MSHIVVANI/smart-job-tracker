// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SettingsPage from './pages/SettingsPage';

const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),

    // 2. Refine heading sizes and weights for a cleaner look
    h4: { // Main dashboard titles
      fontSize: '1.7rem',
      fontWeight: 500, // Reduced from bold to semi-bold
    },
    h5: { // Card titles and modal titles
      fontSize: '1.25rem',
      fontWeight: 500, // Reduced from bold
    },
    h6: { // Secondary titles (e.g., Kanban column titles)
      fontSize: '1.05rem',
      fontWeight: 500, // Reduced from bold
    },
  },

  // 3. Customize specific component styles to remove unnecessary boldness
  components: {
    // Customize Tab styles
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent ALL CAPS
          fontWeight: 500,       // Set a consistent weight
          fontSize: '1rem',
        },
      },
    },
    // Customize Button styles
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent ALL CAPS on buttons
        },
      },
    },
    // Customize Dialog titles for modals
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 500, // Make modal titles semi-bold
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} /> 
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;