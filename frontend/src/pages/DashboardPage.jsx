import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import Navbar from '../components/Navbar';
import AddApplicationModal from '../components/AddApplicationModal';
import ScrapedJobCard from '../components/ScrapedJobCard';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ApplicationsDataGrid from '../components/ApplicationsDataGrid';
import ApplicationsCalendar from '../components/ApplicationsCalendar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

import {
  Container, Typography, Button, Box, CircularProgress, TextField, 
  Paper, Tabs, Tab, Grid, Chip, Stack, ToggleButtonGroup, ToggleButton, 
  Pagination, InputAdornment
} from '@mui/material';

import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

// FIXED COLORS: Accepted and Offer are now highly distinct
const statusColors = {
  Accepted: '#1b5e20', // Deep Forest Green
  Offer: '#c6ff00',    // Bright Neon Lime
  Interviewing: '#ffc107',
  FollowUp: '#9c27b0', 
  Applied: '#2196f3', 
  Discovered: '#9e9e9e', 
  Rejected: '#f44336'
};

function StatusLegend({ filter, onFilterChange }) {
  const toggleFilter = (status) => {
    const newFilter = new Set(filter);
    newFilter.has(status) ? newFilter.delete(status) : newFilter.add(status);
    onFilterChange(newFilter);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
      {Object.entries(statusColors).map(([status, color]) => (
        <Chip
          key={status}
          label={status}
          onClick={() => toggleFilter(status)}
          sx={{
            fontWeight: 700, fontSize: '0.7rem',
            backgroundColor: filter.has(status) ? color : 'white',
            color: filter.has(status) ? (status === 'Offer' ? 'black' : 'white') : color,
            border: `1px solid ${color}`,
            cursor: 'pointer',
            '&:hover': { backgroundColor: color, opacity: 0.9 }
          }}
        />
      ))}
    </Stack>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [filters, setFilters] = useState({ keywords: '' });
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // TAB 1 (DISCOVERY) IS NOW THE DEFAULT
  const [activeTab, setActiveTab] = useState(1); 
  const [viewMode, setViewMode] = useState('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDate, setInitialDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState(new Set());

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleOpenCreateModal = () => { setEditingApplication(null); setInitialDate(null); setIsModalOpen(true); };
  const handleOpenEditModal = (app) => { setEditingApplication(app); setInitialDate(null); setIsModalOpen(true); };

  const handleSaveApplication = async (data) => {
    const req = editingApplication?.id ? api.put(`/applications/${editingApplication.id}`, data) : api.post('/applications', data);
    toast.promise(req, { loading: 'Saving...', success: 'Saved!', error: 'Error.' });
    await req;
    fetchApplications();
    setIsModalOpen(false);
  };

  const handleScrape = async (page = 1, kw = null) => {
    setIsScraping(true);
    const searchKW = kw || filters.keywords;
    try {
      const res = await api.post('/scrape/jobs', { filters: { keywords: searchKW }, page });
      setScrapedJobs(res.data.jobs);
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);
      if (kw) setFilters({ keywords: kw });
    } catch (e) {
      toast.error("Scraping failed");
    } finally {
      setIsScraping(false);
    }
  };

  const filteredApplications = useMemo(() => {
    let data = applications;
    if (searchQuery) {
      data = data.filter(app => app.company.toLowerCase().includes(searchQuery.toLowerCase()) || app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter.size > 0) { data = data.filter(app => statusFilter.has(app.status)); }
    return data;
  }, [applications, searchQuery, statusFilter]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#F2F1E1', minHeight: '100vh', pb: 10 }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 4 }}>
          <Tab label="Tracker" sx={{ fontWeight: 800, textTransform: 'none' }} />
          <Tab label="Discovery" sx={{ fontWeight: 800, textTransform: 'none' }} />
        </Tabs>

        {activeTab === 0 ? (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#2D334A' }}>My Pipeline</Typography>
              <Stack direction="row" spacing={2}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small" sx={{ bgcolor: 'white' }}>
                  <ToggleButton value="calendar"><CalendarViewMonthIcon /></ToggleButton>
                  <ToggleButton value="list"><ViewListIcon /></ToggleButton>
                  <ToggleButton value="analytics"><BarChartIcon /></ToggleButton>
                </ToggleButtonGroup>
                <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#2D334A', borderRadius: 2 }} onClick={handleOpenCreateModal}>
                  Add Job
                </Button>
              </Stack>
            </Stack>

            {viewMode !== 'analytics' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <TextField
                  placeholder="Filter by company or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: '100%', maxWidth: '600px', bgcolor: 'white', borderRadius: '30px', mb: 2, '& fieldset': { border: 'none' }, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
                <StatusLegend filter={statusFilter} onFilterChange={setStatusFilter} />
              </Box>
            )}

            <Box key={viewMode}>
              {viewMode === 'calendar' && <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E1D8C1' }}><ApplicationsCalendar applications={filteredApplications} onEventClick={handleOpenEditModal} onDateClick={(d) => { setInitialDate(d); setIsModalOpen(true); }} /></Paper>}
              {viewMode === 'list' && <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E1D8C1' }}><ApplicationsDataGrid applications={filteredApplications} onEdit={handleOpenEditModal} onDelete={(id) => { setApplicationToDelete(id); setIsDeleteModalOpen(true); }} /></Paper>}
              {viewMode === 'analytics' && <AnalyticsDashboard applications={applications} />}
            </Box>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
             {/* HERO DISCOVERY HUB */}
             <Paper sx={{ p: 6, borderRadius: 10, border: '1px solid #E1D8C1', textAlign: 'center', mb: 6, background: 'white' }}>
                <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: '#f1f5f9', mb: 2 }}><TravelExploreIcon sx={{ fontSize: 50, color: '#2D334A' }} /></Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#2D334A' }}>Explore Opportunities</Typography>
                <Typography variant="body1" sx={{ color: '#A9B7C0', mb: 4, fontWeight: 500 }}>Aggregating millions of roles from LinkedIn, Indeed, and 100+ sources</Typography>
                <Box sx={{ display: 'flex', gap: 1, maxWidth: '700px', mx: 'auto', mb: 3 }}>
                  <TextField fullWidth placeholder="Search by technology, role title, or specific company..." value={filters.keywords} onChange={(e) => setFilters({keywords: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleScrape(1)} InputProps={{ sx: { borderRadius: '50px', bgcolor: '#f8fafc', px: 2 } }} />
                  <Button variant="contained" sx={{ bgcolor: '#2D334A', px: 5, borderRadius: '50px', fontWeight: 800 }} onClick={() => handleScrape(1)} disabled={isScraping}>Find</Button>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {['Full Stack', 'Frontend', 'Remote', 'Internship'].map(tag => (
                    <Chip key={tag} label={tag} onClick={() => handleScrape(1, tag)} sx={{ fontWeight: 700, bgcolor: '#F2F1E1' }} />
                  ))}
                </Stack>
             </Paper>

             {/* UNIFORM LIST VIEW FOR RESULTS */}
             <Stack spacing={2} sx={{ maxWidth: 900, mx: 'auto' }}>
                {scrapedJobs.map((job, i) => (
                  <ScrapedJobCard key={i} job={job} onAddToTracker={(j) => { setEditingApplication({ company: j.company, roleTitle: j.roleTitle, jobUrl: j.jobUrl }); setIsModalOpen(true); }} />
                ))}
             </Stack>

             {totalPages > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination count={totalPages} page={currentPage} onChange={(e, v) => handleScrape(v)} />
                </Box>
             )}
          </Box>
        )}
      </Container>
      <AddApplicationModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveApplication} application={editingApplication} initialDate={initialDate} />
      <ConfirmDeleteModal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={async () => { await api.delete(`/applications/${applicationToDelete}`); fetchApplications(); setIsDeleteModalOpen(false); }} />
    </Box>
  );
}

export default DashboardPage;