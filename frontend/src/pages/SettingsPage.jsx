import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Box, Button, Container, Typography, Paper, Alert, CircularProgress, Link, TextField, Divider } from '@mui/material';
import Navbar from '../components/Navbar';

function SettingsPage() {
  const [connection, setConnection] = useState({ status: 'loading', isConnected: false });
  // New state for phone number
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      // 1. Get Google Auth Status
      const authRes = await api.get('/auth/google/status');
      setConnection(authRes.data);

      // 2. Get User Profile (which now includes phone number)
      const profileRes = await api.get('/profile');
      setPhoneNumber(profileRes.data.phoneNumber || '');
    } catch (error) {
      console.error("Could not fetch settings:", error);
      setConnection({ status: 'error', isConnected: false });
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      // We send the phone number to the profile endpoint
      // Note: We need to send the existing profile text too, or it might get wiped depending on implementation.
      // Ideally, the backend should handle partial updates (PATCH). 
      // For now, let's assume we are just updating the phone number field for this specific UI action.
      // To be safe, we should probably fetch the current profile text first, or update the backend to allow partial updates.
      // Let's assume the backend handles partial updates (Prisma update ignores undefined fields usually, but our controller destructures).
      // Let's fix this properly by fetching first or just sending phone.
      
      // Better approach: Let's fetch the current profile to ensure we don't overwrite it with null
      const currentProfileRes = await api.get('/profile');
      
      await api.put('/profile', { 
        profile: currentProfileRes.data.profile, // Keep existing profile text
        phoneNumber: phoneNumber 
      });
      
      toast.success('Phone number saved!');
    } catch (error) {
      toast.error('Failed to save phone number.');
    } finally {
      setSavingPhone(false);
    }
  };
  
  const googleAuthUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;

  const handleScanNow = async () => {
    const scanPromise = api.post('/email/scan');
    toast.promise(scanPromise, {
      loading: 'Triggering email scan...',
      success: 'Scan triggered! Check the dashboard for updates.',
      error: 'Could not trigger scan.',
    });
  };

  const renderStatus = () => {
    if (connection.status === 'loading') return <CircularProgress size={24} />;
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
            Your connection has expired or was revoked. Please reconnect. 
            <Link href="https://myaccount.google.com/permissions" target="_blank" rel="noopener"> (Manage Permissions)</Link>
          </Alert>
          <Button variant="contained" component="a" href={googleAuthUrl}>Reconnect Google Account</Button>
        </Box>
      );
    }
    return <Button variant="contained" component="a" href={googleAuthUrl}>Connect Google Account</Button>;
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        
        {/* --- GOOGLE CONNECT SECTION --- */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6">Account Connections</Typography>
          <Typography sx={{ my: 2 }}>
            Connect your Google account to enable automatic email scanning.
          </Typography>
          {renderStatus()}
        </Paper>

        {/* --- NEW: SMS NOTIFICATIONS SECTION --- */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>SMS Notifications</Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Enter your phone number to receive text alerts 24 hours before a scheduled interview.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              label="Phone Number (e.g., +1234567890)"
              variant="outlined"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              helperText="Include country code (e.g., +1 for USA, +91 for India)"
            />
            <Button 
              variant="contained" 
              onClick={handleSavePhone} 
              disabled={savingPhone}
              sx={{ mt: 1, height: '56px' }} // Align with input
            >
              {savingPhone ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Paper>

      </Container>
    </Box>
  );
}
export default SettingsPage;