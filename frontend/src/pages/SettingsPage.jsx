import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Box, Button, Container, Typography, Paper, Alert, CircularProgress, Link } from '@mui/material';
import Navbar from '../components/Navbar';

function SettingsPage() {
  const [connection, setConnection] = useState({ status: 'loading', isConnected: false });

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.get('/auth/google/status');
      setConnection(response.data);
    } catch (error) {
      console.error("Could not fetch status:", error);
      setConnection({ status: 'error', isConnected: false });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);
  
  const googleAuthUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;

  const handleScanNow = async () => {
    const scanPromise = api.post('/email/scan');
    toast.promise(scanPromise, {
      loading: 'Triggering email scan...',
      success: 'Scan triggered! Check the dashboard for updates in a few moments.',
      error: 'Could not trigger scan.',
    });
  };

  const renderStatus = () => {
    if (connection.status === 'loading') {
      return <CircularProgress size={24} />;
    }
    if (connection.isConnected && connection.status === 'active') {
      return (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>Your Google account is successfully connected and active.</Alert>
          <Button variant="contained" onClick={handleScanNow}>Scan Inbox Now</Button>
        </Box>
      );
    }
    if (connection.status === 'revoked') {
      return (
        <Box>
          <Alert severity="error" sx={{ mb: 2 }}>
            Your connection has expired or was revoked by Google. Please reconnect your account. 
            <Link href="https://myaccount.google.com/permissions" target="_blank" rel="noopener"> (Manage Permissions)</Link>
          </Alert>
          <Button variant="contained" component="a" href={googleAuthUrl}>Reconnect Google Account</Button>
        </Box>
      );
    }
    // Default case: not connected
    return (
      <Button variant="contained" component="a" href={googleAuthUrl}>Connect Google Account</Button>
    );
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6">Account Connections</Typography>
          <Typography sx={{ my: 2 }}>
            Connect your Google account to enable automatic email scanning. If your connection is revoked, you can manage permissions on your Google account and reconnect here.
          </Typography>
          {renderStatus()}
        </Paper>
      </Container>
    </Box>
  );
}
export default SettingsPage;