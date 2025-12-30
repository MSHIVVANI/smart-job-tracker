import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast'; // Make sure toast is imported if you use it
import { Box, Button, Container, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import Navbar from '../components/Navbar';

function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // This useEffect hook runs once when the component is mounted
  useEffect(() => {
    console.log("SettingsPage: useEffect is running."); // <-- ADDING A TRACER BULLET

    api.get('/auth/google/status')
      .then(response => {
        console.log("SettingsPage: Received status response.", response.data); // <-- TRACER
        setIsConnected(response.data.isConnected);
      })
      .catch(error => {
        console.error("Could not fetch Google connection status:", error);
        toast.error("Could not fetch Google status."); // Use toast for user feedback
      })
      .finally(() => {
        console.log("SettingsPage: Setting loading to false."); // <-- TRACER
        setLoading(false);
      });
  }, []); // The empty dependency array ensures this runs only once.
  
  const handleConnect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You appear to be logged out. Please log in again.");
      return;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const googleAuthUrl = `${baseUrl}/api/auth/google?token=${token}`;
    window.location.href = googleAuthUrl;
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6">Account Connections</Typography>
          <Typography sx={{ my: 2 }}>
            Connect your Google account to enable automatic email scanning. This allows the Smart Job Tracker to find replies from employers and update your application statuses.
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>Loading connection status...</Typography>
            </Box>
          ) : isConnected ? (
            <Alert severity="success">Your Google account is successfully connected.</Alert>
          ) : (
            <Button variant="contained" onClick={handleConnect}>
              Connect Google Account
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
export default SettingsPage;