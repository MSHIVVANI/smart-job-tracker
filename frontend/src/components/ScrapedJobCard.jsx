import { Paper, Typography, Button, Box, Stack } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LaunchIcon from '@mui/icons-material/Launch';
import AddIcon from '@mui/icons-material/Add';

function ScrapedJobCard({ job, onAddToTracker }) {
  const { roleTitle, company, jobUrl } = job;
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, borderRadius: 4, border: '1px solid #E1D8C1', bgcolor: 'white',
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 30px rgba(45,51,74,0.08)' }
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#2D334A', mb: 0.5 }}>{roleTitle}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'left' }}>
            <BusinessIcon sx={{ fontSize: 20, color: '#A9B7C0' }} />
            <Typography variant="subtitle1" sx={{ color: '#A9B7C0', fontWeight: 600 }}>{company}</Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<LaunchIcon />} href={jobUrl} target="_blank" sx={{ borderRadius: 3, textTransform: 'none', color: '#A9B7C0', borderColor: '#E1D8C1', fontWeight: 700 }}>View Job</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAddToTracker(job)} sx={{ borderRadius: 3, textTransform: 'none', bgcolor: '#2D334A', fontWeight: 700, px: 3 }}>Track</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default ScrapedJobCard;