import { Paper, Grid, Typography, Box, Card, Stack } from '@mui/material';
import StatusDonutChart from './StatusDonutChart';
import ActivityLineChart from './ActivityLineChart';
import ConversionFunnelChart from './ConversionFunnelChart';
import StatusTrendsChart from './StatusTrendsChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ p: 3, height: '100%', borderRadius: 4, border: '1px solid #E1D8C1', boxShadow: 'none' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#2D334A' }}>{value}</Typography>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color, display: 'flex' }}>{icon}</Box>
      </Stack>
    </Card>
  );
}

function AnalyticsDashboard({ applications }) {
  const total = applications.length;
  const interviewing = applications.filter(a => a.status === 'Interviewing' || a.status === 'FollowUp').length;
  const offers = applications.filter(a => a.status === 'Offer' || a.status === 'Accepted').length;
  const rate = total > 0 ? (((total - applications.filter(a => a.status === 'Applied' || a.status === 'Discovered').length) / total) * 100).toFixed(0) : 0;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* Stat Row - 4 columns wide */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Pipeline" value={total} icon={<AssignmentIcon />} color="#3b82f6" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Interviews" value={interviewing} icon={<ScheduleIcon />} color="#ffc107" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Offers" value={offers} icon={<CheckCircleIcon />} color="#1b5e20" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Success Rate" value={`${rate}%`} icon={<TrendingUpIcon />} color="#9c27b0" /></Grid>
      </Grid>

      {/* Charts Grid - Forces a 2x2 grid to prevent overlapping */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #E1D8C1', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#2D334A' }}>Pipeline Distribution</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}><StatusDonutChart data={applications} /></Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #E1D8C1', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#2D334A' }}>Search Funnel</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}><ConversionFunnelChart data={applications} /></Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: 480, display: 'flex', flexDirection: 'column', border: '1px solid #E1D8C1', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#2D334A' }}>Activity Velocity</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}><ActivityLineChart data={applications} /></Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: 480, display: 'flex', flexDirection: 'column', border: '1px solid #E1D8C1', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#2D334A' }}>Outcome Trends</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}><StatusTrendsChart data={applications} /></Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsDashboard;