// frontend/src/components/AddApplicationModal.jsx

import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Paper, Divider } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

function AddApplicationModal({ open, onClose, onSave, application }) {
  const [formData, setFormData] = useState({ company: '', roleTitle: '', status: 'Applied', jobUrl: '' });
  const [jobDescription, setJobDescription] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({ company: application.company || '', roleTitle: application.roleTitle || '', status: application.status || 'Applied', jobUrl: application.jobUrl || '' });
    } else {
      setFormData({ company: '', roleTitle: '', status: 'Applied', jobUrl: '' });
    }
    setJobDescription('');
    setSuggestions('');
  }, [application, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  const handleGenerateSuggestions = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description first.');
      return;
    }
    setIsGenerating(true);
    setSuggestions('');
    try {
      const profileRes = await api.get('/profile');
      const masterProfile = profileRes.data.profile;

      if (!masterProfile || !masterProfile.trim()) {
        toast.error('Your master profile is empty. Please save it on the "My Profile" page first.', { duration: 4000 });
        setIsGenerating(false);
        return;
      }

      const aiRes = await api.post('/ai/suggest-bullets', {
        master_profile: masterProfile,
        job_description: jobDescription,
      });

      setSuggestions(aiRes.data.suggestions);
      toast.success('Suggestions generated!');
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast.error('Could not generate suggestions.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">{application ? 'Edit Application' : 'Add New Application'}</Typography>
        <TextField margin="normal" required fullWidth label="Company" name="company" value={formData.company} onChange={handleChange} />
        <TextField margin="normal" required fullWidth label="Role Title" name="roleTitle" value={formData.roleTitle} onChange={handleChange} />
        <TextField margin="normal" required fullWidth label="Status" name="status" value={formData.status} onChange={handleChange} />
        <TextField margin="normal" fullWidth label="Job URL (Optional)" name="jobUrl" value={formData.jobUrl} onChange={handleChange} />
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">AI Resume Helper</Typography>
          <TextField
            label="Paste Job Description Here"
            multiline
            rows={8}
            fullWidth
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            helperText="Paste the full job description to get tailored resume suggestions."
            variant="outlined"
          />
          <Button onClick={handleGenerateSuggestions} disabled={isGenerating} sx={{ mt: 1 }}>
            {isGenerating ? <CircularProgress size={24} /> : 'Generate Suggestions'}
          </Button>
          {suggestions && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', maxHeight: 200, overflowY: 'auto' }}>
              <Typography variant="body2">{suggestions}</Typography>
            </Paper>
          )}
        </Box>
        <Button type="submit" variant="contained" sx={{ mt: 3, width: '100%' }}>
          {application ? 'Save Changes' : 'Create Application'}
        </Button>
      </Box>
    </Modal>
  );
}

export default AddApplicationModal;