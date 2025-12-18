import { Card, CardContent, Typography, Button, Box } from '@mui/material';

function ScrapedJobCard({ job, onAddToTracker }) {
  const { roleTitle, company, jobUrl } = job;
  return (
    <Card sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h6">{roleTitle}</Typography>
        <Typography color="text.secondary">{company}</Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => onAddToTracker(job)}>Add to Tracker</Button>
          <Button href={jobUrl} target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>View Job</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
export default ScrapedJobCard;