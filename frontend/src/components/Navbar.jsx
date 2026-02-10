import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Stack } from '@mui/material';
import Logo from './Logo';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'rgba(242, 241, 225, 0.8)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid #E1D8C1',
        zIndex: 1100
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          {/* Logo Section */}
          <Box 
            sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5, cursor: 'pointer' }} 
            onClick={() => navigate('/dashboard')}
          >
            <Logo size={32} color="#2D334A" />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#2D334A', 
                fontWeight: 900, 
                letterSpacing: '-1px',
                fontSize: '1.4rem' 
              }}
            >
              SmartTrack
            </Typography>
          </Box>
          
          {/* Navigation Links */}
          <Stack direction="row" spacing={1} alignItems="center">
            {navLinks.map((link) => (
              <Button 
                key={link.path}
                component={RouterLink} 
                to={link.path}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2,
                  borderRadius: 2,
                  color: isActive(link.path) ? '#2D334A' : '#A9B7C0',
                  bgcolor: isActive(link.path) ? '#E1D8C1' : 'transparent',
                  '&:hover': { bgcolor: '#E1D8C1' }
                }}
              >
                {link.label}
              </Button>
            ))}
            
            <Box sx={{ width: '1px', height: '24px', bgcolor: '#E1D8C1', mx: 1 }} />

            <Button 
              onClick={handleLogout}
              sx={{ 
                color: '#f44336', 
                textTransform: 'none', 
                fontWeight: 700,
                '&:hover': { bgcolor: '#fef2f2' } 
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;