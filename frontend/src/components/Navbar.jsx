// frontend/src/components/Navbar.jsx

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            Smart Job Tracker
          </RouterLink>
        </Typography>
        
        <Button color="inherit" component={RouterLink} to="/profile">
          My Profile
        </Button>
        
        {/* --- NEW SETTINGS BUTTON --- */}
        <Button color="inherit" component={RouterLink} to="/settings">
          Settings
        </Button>

        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;