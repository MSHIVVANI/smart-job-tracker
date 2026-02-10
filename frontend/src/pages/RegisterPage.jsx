import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { TextField, Button, Container, Typography, Box, Alert, Paper, Stack } from '@mui/material';
import Logo from '../components/Logo';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    
    try {
      await api.post('/auth/register', { email, password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#F2F1E1' }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            borderRadius: 6, 
            border: '1px solid #E1D8C1', 
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(45,51,74,0.05)'
          }}
        >
          <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Logo size={64} color="#2D334A" />
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#2D334A', letterSpacing: '-1.5px' }}>
              Create Account
            </Typography>
            <Typography sx={{ color: '#A9B7C0', fontWeight: 500 }}>
              Secure your next role faster. Connect your Gmail, upload your resume, and let AI manage your application lifecycle
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal" required fullWidth label="Email Address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fcfcf9' } }}
            />
            <TextField
              margin="normal" required fullWidth label="Password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fcfcf9' } }}
            />
            <Button 
              type="submit" fullWidth variant="contained" 
              sx={{ 
                mt: 4, mb: 3, py: 1.5, borderRadius: 3, bgcolor: '#2D334A', 
                fontWeight: 800, fontSize: '1rem', textTransform: 'none'
              }}
            >
              Sign Up
            </Button>
            <Link to="/login" style={{ textDecoration: 'none', color: '#A9B7C0', fontWeight: 600 }}>
              Already have an account? <span style={{ color: '#2D334A' }}>Sign In</span>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPage;