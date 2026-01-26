import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast'; // Import toast
import { TextField, Button, Container, Typography, Box, Alert, Paper } from '@mui/material';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* --- Logo --- */}
        <Box
          component="img"
          src="/logo.svg"
          alt="Smart Job Tracker Logo"
          sx={{ height: 40, mb: 2 }}
        />

        {/* --- App Title --- */}
        <Typography component="h1" variant="h4" gutterBottom>
          Smart Job Tracker
        </Typography>

        {/* --- App Description --- */}
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Your intelligent copilot for discovering opportunities, tracking applications, and optimizing your resume.
        </Typography>
        
        <Typography component="h2" variant="h5">
          Sign In
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%', maxWidth: '400px' }}>
          <TextField
            margin="normal" required fullWidth
            id="email" label="Email Address" name="email"
            autoComplete="email" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth
            name="password" label="Password" type="password" id="password"
            autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>
          <Box textAlign="center">
            <Link to="/register" variant="body2" style={{ textDecoration: 'none' }}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;