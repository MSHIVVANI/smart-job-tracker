// frontend/src/pages/DashboardPage.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import Navbar from '../components/Navbar';
import AddApplicationModal from '../components/AddApplicationModal';
import ScrapedJobCard from '../components/ScrapedJobCard';
import KanbanBoard from '../components/KanbanBoard';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Container, Typography, Button, Box, CircularProgress, Alert, TextField, Paper, Tabs, Tab, Grid } from '@mui/material';

// Define the columns for the Kanban board
const columns = {
  Discovered: { id: 'Discovered', title: 'Discovered' },
  Applied: { id: 'Applied', title: 'Applied' },
  Interviewing: { id: 'Interviewing', title: 'Interviewing' },
  Offer: { id: 'Offer', title: 'Offer' },
  Rejected: { id: 'Rejected', title: 'Rejected' },
};

function DashboardPage() {
  // State variables
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [filters, setFilters] = useState({ category: 'Full-Stack Programming', keywords: '', country: '', salary: '', skills: '' });
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // <-- NEW state for the search filter

  const navigate = useNavigate();

  // --- Data Fetching ---
  const fetchApplications = useCallback(async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications.');
      if (err.response && err.response.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // --- Handlers ---
  const handleOpenCreateModal = () => { setEditingApplication(null); setIsModalOpen(true); };
  const handleOpenEditModal = (app) => { setEditingApplication(app); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingApplication(null); };

  const handleSaveApplication = async (formData) => {
    const isEditing = editingApplication && editingApplication.id;
    const savePromise = isEditing ? api.put(`/applications/${editingApplication.id}`, formData) : api.post('/applications', formData);
    toast.promise(savePromise, { loading: 'Saving...', success: <b>Saved!</b>, error: <b>Could not save.</b> });
    try { await savePromise; fetchApplications(); handleCloseModal(); } catch (err) { console.error(err); }
  };

  const handleOpenDeleteModal = (appId) => { setApplicationToDelete(appId); setIsDeleteModalOpen(true); };
  const handleConfirmDelete = async () => {
    if (applicationToDelete) {
      const deletePromise = api.delete(`/applications/${applicationToDelete}`);
      toast.promise(deletePromise, { loading: 'Deleting...', success: <b>Deleted.</b>, error: <b>Could not delete.</b> });
      try { await deletePromise; fetchApplications(); } catch (err) { console.error(err); }
    }
    setIsDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleScrape = async () => {
    setIsScraping(true); setError(''); setScrapedJobs([]);
    try {
      const response = await api.post('/scrape/jobs', filters);
      setScrapedJobs(response.data);
      toast.success(`Found ${response.data.length} jobs!`);
    } catch (err) { toast.error('Failed to find jobs.'); } finally { setIsScraping(false); }
  };

  const handleAddToTracker = (job) => {
    const newAppData = { company: job.company, roleTitle: job.roleTitle, jobUrl: job.jobUrl, status: 'Discovered' };
    setEditingApplication(newAppData); setIsModalOpen(true);
  };

  const handleTabChange = (event, newValue) => { setActiveTab(newValue); };

  // --- NEW: Memoized hook to filter applications based on searchQuery ---
  const filteredApplications = useMemo(() => {
    if (!searchQuery) {
      return applications; // Return all if search is empty
    }
    return applications.filter(app =>
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applications, searchQuery]);

  // --- UPDATED: This hook now groups the *filtered* list ---
  const applicationsByColumn = useMemo(() => {
    const grouped = {};
    Object.keys(columns).forEach(key => { grouped[key] = []; });
    filteredApplications.forEach(app => {
      if (grouped[app.status]) { grouped[app.status].push(app); }
    });
    return grouped;
  }, [filteredApplications]);

  const handleOnDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    const newStatus = destination.droppableId;
    const originalStatus = source.droppableId;
    const movedApp = applications.find(app => app.id === draggableId);
    if (!movedApp) return;
    setApplications(prev => prev.map(app => app.id === draggableId ? { ...app, status: newStatus } : app));
    try {
      await api.put(`/applications/${draggableId}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update. Reverting.');
      setApplications(prev => prev.map(app => app.id === draggableId ? { ...app, status: originalStatus } : app));
    }
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Navbar />
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="My Tracked Applications" />
            <Tab label="Discover New Jobs" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
              <Typography variant="h4">My Tracked Applications</Typography>
              <Button variant="contained" color="secondary" onClick={handleOpenCreateModal}>Add Manually</Button>
            </Box>

            {/* --- NEW: Search Bar UI --- */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search by Company or Role Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Paper>

            {error && <Alert severity="error">{error}</Alert>}
            
            {applications.length > 0 ? (
              <KanbanBoard
                columns={columns}
                data={applicationsByColumn} // This now passes the filtered data
                onDragEnd={handleOnDragEnd}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ) : (
              <Paper sx={{ mt: 4, p: 5, textAlign: 'center', backgroundColor: '#fafafa' }}>
                <Typography variant="h6" gutterBottom>Your board is empty!</Typography>
                <Typography color="text.secondary">Add an application manually or find one in the "Discover New Jobs" tab.</Typography>
              </Paper>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>Find New Jobs (from We Work Remotely)</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}><TextField label="Job Category" name="category" value={filters.category} onChange={handleFilterChange} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Keywords" name="keywords" value={filters.keywords} onChange={handleFilterChange} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Country" name="country" value={filters.country} onChange={handleFilterChange} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Skills" name="skills" value={filters.skills} onChange={handleFilterChange} fullWidth /></Grid>
                <Grid item xs={12}><TextField label="Salary Range" name="salary" value={filters.salary} onChange={handleFilterChange} fullWidth /></Grid>
              </Grid>
              <Button variant="contained" onClick={handleScrape} disabled={isScraping}>{isScraping ? 'Searching...' : 'Find Jobs'}</Button>
              {isScraping && <CircularProgress size={24} sx={{ ml: 2, verticalAlign: 'middle' }} />}
            </Paper>
            {scrapedJobs.length > 0 && (
              <Box>
                <Typography variant="h4" gutterBottom>Discovered Jobs</Typography>
                {scrapedJobs.map((job, index) => <ScrapedJobCard key={index} job={job} onAddToTracker={handleAddToTracker} />)}
              </Box>
            )}
          </Box>
        )}
      </Container>
      
      <AddApplicationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveApplication}
        application={editingApplication}
      />
      
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

export default DashboardPage;