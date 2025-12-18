// frontend/src/pages/ProfilePage.jsx

import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Box, Button, Container, Typography, Paper, TextField, CircularProgress } from '@mui/material';
import Navbar from '../components/Navbar';

function ProfilePage() {
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's existing profile when the page loads
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setProfile(response.data.profile);
    } catch (error) {
      toast.error('Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Function to handle saving the updated profile
  const handleSave = async () => {
    const savePromise = api.put('/profile', { profile });

    toast.promise(savePromise, {
      loading: 'Saving profile...',
      success: 'Profile saved successfully!',
      error: 'Could not save profile.',
    });
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Master Profile
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Enter your master resume or a detailed summary of your key skills and experiences below. This profile will be used by the AI to help generate tailored bullet points for your job applications.
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              label="Master Profile / Resume Summary"
              multiline
              rows={15}
              fullWidth
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              variant="outlined"
            />
          )}
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave} disabled={loading}>
            Save Profile
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default ProfilePage;