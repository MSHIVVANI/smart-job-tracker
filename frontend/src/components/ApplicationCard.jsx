// frontend/src/components/ApplicationCard.jsx

import { Card, CardContent, CardActions, Typography, Link, Button, Box } from '@mui/material';
import { formatDistanceToNow } from 'date-fns'; // <-- Import the function

function ApplicationCard({ application, onEdit, onDelete }) {
  // Destructure updatedAt along with the other properties
  const { roleTitle, company, status, jobUrl, updatedAt } = application;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Main Content */}
        <Typography variant="h5" component="div">{roleTitle}</Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">{company}</Typography>
        <Typography variant="body2">Status: <strong>{status}</strong></Typography>
        {jobUrl && (
          <Link href={jobUrl} target="_blank" rel="noopener noreferrer" sx={{ mt: 1, display: 'block' }}>
            View Job Posting
          </Link>
        )}
      </CardContent>

      {/* --- Actions and Timestamp section --- */}
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
        {/* Action Buttons on the left */}
        <Box>
          <Button size="small" onClick={() => onEdit(application)}>Edit</Button>
          <Button size="small" color="error" onClick={() => onDelete(application.id)}>Delete</Button>
        </Box>
        {/* Timestamp on the right */}
        {updatedAt && ( // Only display if the updatedAt field exists
          <Typography variant="caption" color="text.secondary">
            {/* Format and display the timestamp */}
            Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </Typography>
        )}
      </CardActions>
    </Card>
  );
}

export default ApplicationCard;