import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Box, Button, Container, Typography, Paper, Alert, CircularProgress, 
  Link, TextField, Divider, Stack 
} from '@mui/material';
import Navbar from '../components/Navbar';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

function SettingsPage() {
  const [connection, setConnection] = useState({ status: 'loading', isConnected: false });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const authRes = await api.get('/auth/google/status');
      setConnection(authRes.data);
      const profileRes = await api.get('/profile');
      setPhoneNumber(profileRes.data.phoneNumber || '');
    } catch (error) {
      setConnection({ status: 'error', isConnected: false });
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      const currentProfileRes = await api.get('/profile');
      await api.put('/profile', { 
        profile: currentProfileRes.data.profile, 
        phoneNumber: phoneNumber 
      });
      toast.success('Phone number saved!');
    } catch (error) {
      toast.error('Failed to save phone number.');
    } finally {
      setSavingPhone(false);
    }
  };
  
  const getGoogleAuthUrl = () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/api/auth/google?token=${token}`;
  };

  const handleScanNow = async () => {
    api.post('/email/scan');
    toast.success('Scan triggered');
  };

  const renderStatus = () => {
    if (connection.status === 'loading') return <CircularProgress size={24} />;
    if (connection.isConnected && connection.status === 'active') {
      return (
        <Box>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Connected & Active</Alert>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleScanNow} sx={{ bgcolor: '#2D334A' }}>Scan Now</Button>
            <Button variant="outlined" component="a" href={getGoogleAuthUrl()} sx={{ color: '#2D334A', borderColor: '#E1D8C1' }}>Reconnect</Button>
          </Stack>
        </Box>
      );
    }
    return <Button variant="contained" startIcon={<GoogleIcon />} component="a" href={getGoogleAuthUrl()} sx={{ bgcolor: '#2D334A' }}>Connect Google Account</Button>;
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#2D334A' }}>Settings</Typography>
        
        <Paper sx={{ p: 4, borderRadius: 5, mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <GoogleIcon sx={{ color: '#2D334A' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Email Integration</Typography>
          </Stack>
          <Typography sx={{ mb: 3, color: 'text.secondary' }}>Track job updates via Gmail.</Typography>
          <Divider sx={{ mb: 3 }} />
          {renderStatus()}
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <PhoneIphoneIcon sx={{ color: '#2D334A' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>SMS Notifications</Typography>
          </Stack>
          <Typography sx={{ mb: 3, color: 'text.secondary' }}>Receive text reminders for interviews.</Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <Button variant="contained" onClick={handleSavePhone} disabled={savingPhone} sx={{ bgcolor: '#2D334A', px: 4 }}>Save</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SettingsPage;