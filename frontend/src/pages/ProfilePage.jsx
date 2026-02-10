import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Box, Button, Container, Typography, Paper, TextField, CircularProgress, Stack } from '@mui/material';
import Navbar from '../components/Navbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ProfilePage() {
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data.profile);
    } catch (error) {
      toast.error('Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setParsing(true);
    const tid = toast.loading('Parsing resume...');

    try {
      // Note: Do not set Content-Type header manually, axios/browser does it for FormData
      const res = await api.post('/profile/upload', formData);
      setProfile(res.data.profile);
      toast.success('Profile updated!', { id: tid });
    } catch (err) {
      console.error('Frontend Upload Error:', err.response?.data || err.message);
      toast.error('Failed to parse PDF', { id: tid });
    } finally {
      setParsing(false);
      // Clear input so same file can be uploaded again
      event.target.value = null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#F2F1E1', minHeight: '100vh', pb: 10 }}>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#2D334A', mb: 4 }}>My Master Profile</Typography>

        <Paper sx={{ p: 4, borderRadius: 5, mb: 4, border: '1px solid #E1D8C1' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Resume Smart-Sync</Typography>
              <Typography variant="body2" color="text.secondary">Upload a PDF to auto-fill your skills.</Typography>
            </Box>
            <Button
              variant="contained"
              component="label"
              startIcon={parsing ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              disabled={parsing}
              sx={{ bgcolor: '#2D334A', borderRadius: 3, px: 4 }}
            >
              {parsing ? 'Processing...' : 'Upload PDF'}
              <input type="file" hidden accept=".pdf" onChange={handleFileUpload} />
            </Button>
          </Stack>
        </Paper>

        <TextField
          multiline rows={15} fullWidth
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          sx={{ bgcolor: 'white', borderRadius: 1, '& fieldset': { borderColor: '#E1D8C1' } }}
        />
        
        <Button 
          variant="contained" 
          fullWidth 
          onClick={() => {
            api.put('/profile', { profile }).then(() => toast.success('Profile Saved!'));
          }}
          sx={{ mt: 3, py: 1.5, bgcolor: '#2D334A', borderRadius: 3 }}
        >
          Save Changes Manually
        </Button>
      </Container>
    </Box>
  );
}

export default ProfilePage;