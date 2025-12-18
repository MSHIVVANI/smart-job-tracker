import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the authentication token from browser storage
    localStorage.removeItem('token');
    // Redirect the user to the login page
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Title that links back to the main dashboard */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            Smart Job Tracker
          </RouterLink>
        </Typography>
        
        {/* Link to the user's profile page */}
        <Button color="inherit" component={RouterLink} to="/profile">
          My Profile
        </Button>

        {/* Logout Button */}
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;