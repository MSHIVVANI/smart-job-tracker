import { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Grid } from '@mui/material';

const style = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  bgcolor: 'background.paper', border: '1px solid #ccc',
  boxShadow: 24, p: 4, borderRadius: '8px', maxHeight: '90vh', overflowY: 'auto',
};

const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

function AddApplicationModal({ open, onClose, onSave, application, initialDate }) {
  const [formData, setFormData] = useState({
    company: '', roleTitle: '', status: 'Applied', jobUrl: '',
    interviewDate: null, offerDeadline: null, followUpDate: null, notes: ''
  });

  useEffect(() => {
    const defaultData = {
      company: '', roleTitle: '', status: 'Applied', jobUrl: '',
      interviewDate: initialDate || null, offerDeadline: null,
      followUpDate: null, notes: '',
    };
    setFormData(application ? { ...defaultData, ...application } : defaultData);
  }, [application, open, initialDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      interviewDate: formData.interviewDate || null,
      offerDeadline: formData.offerDeadline || null,
      followUpDate: formData.followUpDate || null,
    };
    onSave(dataToSave);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">{application ? 'Edit Application' : 'Add Application'}</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}><TextField required fullWidth label="Company" name="company" value={formData.company} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField required fullWidth label="Role Title" name="roleTitle" value={formData.roleTitle} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField required fullWidth label="Status" name="status" value={formData.status} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Job URL" name="jobUrl" value={formData.jobUrl} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Interview Date" name="interviewDate" type="date" value={formatDateForInput(formData.interviewDate)} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Offer Deadline" name="offerDeadline" type="date" value={formatDateForInput(formData.offerDeadline)} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Follow-up Date" name="followUpDate" type="date" value={formatDateForInput(formData.followUpDate)} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Notes" name="notes" multiline rows={4} value={formData.notes} onChange={handleChange} /></Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 3, width: '100%' }}>
          {application ? 'Save Changes' : 'Create Application'}
        </Button>
      </Box>
    </Modal>
  );
}
export default AddApplicationModal;