import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E1D8C1' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
            <Box sx={{ bgcolor: '#2D334A', p: 0.8, borderRadius: 2, display: 'flex' }}>
              <WorkIcon sx={{ color: '#F2F1E1', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#2D334A', letterSpacing: '-0.5px' }}>
              SmartTrack
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'My Profile', path: '/profile' },
              { label: 'Settings', path: '/settings' }
            ].map((link) => (
              <Button 
                key={link.path}
                component={RouterLink} 
                to={link.path}
                sx={{ 
                  color: isActive(link.path) ? '#2D334A' : '#A9B7C0',
                  bgcolor: isActive(link.path) ? '#F2F1E1' : 'transparent',
                  '&:hover': { bgcolor: '#F2F1E1' }
                }}
              >
                {link.label}
              </Button>
            ))}
            
            <Button 
              onClick={handleLogout}
              sx={{ color: '#ef4444', ml: 2, '&:hover': { bgcolor: '#fef2f2' } }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;