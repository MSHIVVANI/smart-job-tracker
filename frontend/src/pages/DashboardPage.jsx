import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'; // <-- Import Socket.io client
import toast from 'react-hot-toast';
import api from '../api';
import Navbar from '../components/Navbar';
import AddApplicationModal from '../components/AddApplicationModal';
import ScrapedJobCard from '../components/ScrapedJobCard';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ApplicationsDataGrid from '../components/ApplicationsDataGrid';
import ApplicationsCalendar from '../components/ApplicationsCalendar';
import { Container, Typography, Button, Box, CircularProgress, Alert, TextField, Paper, Tabs, Tab, Grid, Chip, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';

// --- Status Legend Component ---
const statusColors = {
  Accepted: '#009688', Offer: '#4caf50', Interviewing: '#ffc107',
  FollowUp: '#9c27b0', Applied: '#2196f3', Discovered: '#9e9e9e', Rejected: '#f44336'
};

function StatusLegend({ filter, onFilterChange }) {
  const toggleFilter = (status) => {
    const newFilter = new Set(filter);
    newFilter.has(status) ? newFilter.delete(status) : newFilter.add(status);
    onFilterChange(newFilter);
  };
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
      {Object.entries(statusColors).map(([status, color]) => (
        <Chip
          key={status}
          label={status}
          onClick={() => toggleFilter(status)}
          sx={{
            backgroundColor: filter.has(status) ? color : '#e0e0e0',
            color: filter.has(status) ? 'white' : 'inherit',
            '&:hover': { cursor: 'pointer' },
          }}
        />
      ))}
    </Stack>
  );
}

function DashboardPage() {
  // All state variables are complete and correct
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [filters, setFilters] = useState({ category: '', keywords: '', country: '', salary: '', skills: '' });
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDate, setInitialDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState(new Set());
  const navigate = useNavigate();

  // --- Handlers (Complete and Correct) ---
  const fetchApplications = useCallback(async () => { try { const response = await api.get('/applications'); setApplications(response.data); } catch (err) { console.error(err); setError('Failed to load applications.'); if (err.response?.status === 401) navigate('/login'); } finally { setLoading(false); } }, [navigate]);
  
  // --- REAL-TIME UPDATE LISTENER ---
  useEffect(() => {
    // Initial fetch
    fetchApplications();

    // Connect to the WebSocket server
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('🔌 WebSocket connection established. Listening for updates...');
    });

    // Listen for the 'application-updated' event from the server
    socket.on('application-updated', (data) => {
      console.log('Received real-time update from server:', data);
      toast.success(`Status for "${data.updatedApp.roleTitle}" was automatically updated!`);
      // Re-fetch all applications to get the latest data
      fetchApplications();
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [fetchApplications]); // Dependency array ensures this sets up once

  const handleOpenCreateModal = () => { setInitialDate(null); setEditingApplication(null); setIsModalOpen(true); };
  const handleOpenEditModal = (app) => { setInitialDate(null); setEditingApplication(app); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingApplication(null); setInitialDate(null); };
  const handleSaveApplication = async (formData) => { const isEditing = editingApplication?.id; const savePromise = isEditing ? api.put(`/applications/${editingApplication.id}`, formData) : api.post('/applications', formData); toast.promise(savePromise, { loading: 'Saving...', success: <b>Saved!</b>, error: <b>Could not save.</b> }); try { await savePromise; fetchApplications(); handleCloseModal(); } catch (err) { console.error(err); } };
  const handleOpenDeleteModal = (appId) => { setApplicationToDelete(appId); setIsDeleteModalOpen(true); };
  const handleConfirmDelete = async () => { if (!applicationToDelete) return; const deletePromise = api.delete(`/applications/${applicationToDelete}`); toast.promise(deletePromise, { loading: 'Deleting...', success: <b>Deleted.</b>, error: <b>Could not delete.</b> }); try { await deletePromise; fetchApplications(); } catch (err) { console.error(err); } finally { setIsDeleteModalOpen(false); setApplicationToDelete(null); } };
  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
  const handleScrape = async () => { setIsScraping(true); setError(''); setScrapedJobs([]); try { const response = await api.post('/scrape/jobs', filters); setScrapedJobs(response.data); if (response.data.length) toast.success(`Found ${response.data.length} jobs!`); } catch (err) { toast.error('Failed to find jobs.'); } finally { setIsScraping(false); } };
  const handleAddToTracker = (job) => { const newAppData = { company: job.company, roleTitle: job.roleTitle, jobUrl: job.jobUrl, status: 'Discovered' }; setEditingApplication(newAppData); setIsModalOpen(true); };
  const handleTabChange = (event, newValue) => { setActiveTab(newValue); };
  const handleViewChange = (event, newViewMode) => { if (newViewMode) setViewMode(newViewMode); };
  const handleDateClick = (dateStr) => { setInitialDate(dateStr); setEditingApplication(null); setIsModalOpen(true); };
  const onFilterChange = (newFilter) => setStatusFilter(newFilter);

  // Single source of truth for filtered data
  const filteredApplications = useMemo(() => {
    let filtered = applications;
    if (searchQuery) { filtered = filtered.filter(app => app.company.toLowerCase().includes(searchQuery.toLowerCase()) || app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())); }
    if (statusFilter.size > 0) { filtered = filtered.filter(app => statusFilter.has(app.status)); }
    return filtered;
  }, [applications, searchQuery, statusFilter]);
  
  if (loading) { return (<Box><Navbar /><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box></Box>); }

  return (
    <Box>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}><Tab label="My Tracked Applications" /><Tab label="Discover New Jobs" /></Tabs>
        </Box>
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
              <Typography variant="h4">My Tracked Applications</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange}><ToggleButton value="calendar"><CalendarViewMonthIcon /></ToggleButton><ToggleButton value="list"><ViewListIcon /></ToggleButton></ToggleButtonGroup>
                <Button variant="contained" color="secondary" onClick={handleOpenCreateModal}>Add Manually</Button>
              </Box>
            </Box>
            <Paper sx={{ p: 2, mb: 3 }}><TextField fullWidth variant="outlined" label="Search by Company or Role Title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></Paper>
            <StatusLegend filter={statusFilter} onFilterChange={onFilterChange} />
            <Paper sx={{ p: 2 }}>
              {viewMode === 'calendar' ? (
                <ApplicationsCalendar
                  applications={filteredApplications}
                  onEventClick={handleOpenEditModal}
                  onDateClick={handleDateClick}
                />
              ) : (
                filteredApplications.length > 0 ? (
                  <ApplicationsDataGrid
                    applications={filteredApplications}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                ) : (
                  <Box sx={{ p: 5, textAlign: 'center', minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6">No applications match your current filters.</Typography>
                  </Box>
                )
              )}
            </Paper>
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>Find New Jobs</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} sm={6}><TextField label="Job Category" name="category" value={filters.category} onChange={handleFilterChange} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Keywords" name="keywords" value={filters.keywords} onChange={handleFilterChange} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Country" name="country" value={filters.country} onChange={handleFilterChange} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Skills" name="skills" value={filters.skills} onChange={handleFilterChange} fullWidth /></Grid><Grid item xs={12}><TextField label="Salary Range" name="salary" value={filters.salary} onChange={handleFilterChange} fullWidth /></Grid></Grid><Button variant="contained" onClick={handleScrape} disabled={isScraping}>{isScraping ? 'Searching...' : 'Find Jobs'}</Button>{isScraping && <CircularProgress size={24} sx={{ ml: 2, verticalAlign: 'middle' }} />}
            </Paper>
            {scrapedJobs.length > 0 ? (
              <Box>
                <Typography variant="h4" gutterBottom>Discovered Jobs</Typography>
                {scrapedJobs.map((job, index) => <ScrapedJobCard key={index} job={job} onAddToTracker={handleAddToTracker} />)}
              </Box>
            ) : (
              !isScraping && (<Paper sx={{ mt: 4, p: 4, textAlign: 'center', backgroundColor: '#fafafa' }}><Typography variant="h6" gutterBottom>No jobs found.</Typography><Typography color="text.secondary">Use the form above to discover new opportunities.</Typography></Paper>)
            )}
          </Box>
        )}
      </Container>
      <AddApplicationModal open={isModalOpen} onClose={handleCloseModal} onSave={handleSaveApplication} application={editingApplication} initialDate={initialDate} />
      <ConfirmDeleteModal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} />
    </Box>
  );
}

export default DashboardPage;