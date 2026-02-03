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
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Paper,
  Tabs,
  Tab,
  Grid,
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Pagination
} from '@mui/material';

import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import BarChartIcon from '@mui/icons-material/BarChart';

/* ---------- Status Legend ---------- */

const statusColors = {
  Accepted: '#009688',
  Offer: '#4caf50',
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
    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
      {Object.entries(statusColors).map(([status, color]) => (
        <Chip
          key={status}
          label={status}
          onClick={() => toggleFilter(status)}
          sx={{
            backgroundColor: filter.has(status) ? color : '#e0e0e0',
            color: filter.has(status) ? 'white' : 'inherit',
            cursor: 'pointer'
          }}
        />
      ))}
    </Stack>
  );
}

/* ---------- Dashboard Page ---------- */

function DashboardPage() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  const [filters, setFilters] = useState({
    category: '',
    keywords: '',
    country: '',
    salary: '',
    skills: ''
  });

  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [isScraping, setIsScraping] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('calendar'); // calendar | list | analytics
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDate, setInitialDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  /* ---------- Fetch Applications ---------- */

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load applications.');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  /* ---------- CRUD ---------- */

  const handleOpenCreateModal = () => {
    setInitialDate(null);
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setInitialDate(null);
    setEditingApplication(app);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApplication(null);
    setInitialDate(null);
  };

  const handleSaveApplication = async (data) => {
    const req = editingApplication?.id
      ? api.put(`/applications/${editingApplication.id}`, data)
      : api.post('/applications', data);

    toast.promise(req, {
      loading: 'Saving...',
      success: 'Saved!',
      error: 'Could not save.'
    });

    await req;
    fetchApplications();
    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    const req = api.delete(`/applications/${applicationToDelete}`);
    toast.promise(req, {
      loading: 'Deleting...',
      success: 'Deleted!',
      error: 'Failed.'
    });
    await req;
    fetchApplications();
    setIsDeleteModalOpen(false);
  };

  /* ---------- Scraper ---------- */

  const handleScrape = async (page = 1) => {
    setIsScraping(true);
    const res = await api.post('/scrape/jobs', { filters, page });
    setScrapedJobs(res.data.jobs);
    setTotalPages(res.data.totalPages);
    setCurrentPage(page);
    setIsScraping(false);
  };

  /* ---------- Filtering ---------- */

  const filteredApplications = useMemo(() => {
    let data = applications;

    if (searchQuery) {
      data = data.filter(app =>
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter.size > 0) {
      data = data.filter(app => statusFilter.has(app.status));
    }

    return data;
  }, [applications, searchQuery, statusFilter]);

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="My Tracked Applications" />
          <Tab label="Discover New Jobs" />
        </Tabs>

        {activeTab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4">My Tracked Applications</Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)}>
                  <ToggleButton value="calendar"><CalendarViewMonthIcon /></ToggleButton>
                  <ToggleButton value="list"><ViewListIcon /></ToggleButton>
                  <ToggleButton value="analytics"><BarChartIcon /></ToggleButton>
                </ToggleButtonGroup>

                <Button variant="contained" onClick={handleOpenCreateModal}>
                  Add Manually
                </Button>
              </Box>
            </Box>

            {viewMode !== 'analytics' && (
              <>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search by company or role"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Paper>

                <StatusLegend filter={statusFilter} onFilterChange={setStatusFilter} />
              </>
            )}

            <Paper sx={{ p: 2 }}>
              {viewMode === 'calendar' && (
                <ApplicationsCalendar
                  applications={filteredApplications}
                  onEventClick={handleOpenEditModal}
                  onDateClick={(d) => {
                    setInitialDate(d);
                    setIsModalOpen(true);
                  }}
                />
              )}

              {viewMode === 'list' && (
                filteredApplications.length ? (
                  <ApplicationsDataGrid
                    applications={filteredApplications}
                    onEdit={handleOpenEditModal}
                    onDelete={(id) => {
                      setApplicationToDelete(id);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ) : (
                  <Typography align="center" sx={{ py: 5 }}>
                    No applications match your filters.
                  </Typography>
                )
              )}

              {viewMode === 'analytics' && (
                <Box sx={{ width: '100%' }}>
                  <AnalyticsDashboard applications={applications} />
                </Box>
              )}
            </Paper>
          </>
        )}

        {activeTab === 1 && (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                {Object.keys(filters).map(key => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      label={key}
                      name={key}
                      value={filters[key]}
                      onChange={(e) =>
                        setFilters(prev => ({ ...prev, [key]: e.target.value }))
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <Button sx={{ mt: 2 }} variant="contained" onClick={() => handleScrape(1)}>
                {isScraping ? 'Searching...' : 'Find Jobs'}
              </Button>
            </Paper>

            {scrapedJobs.map((job, i) => (
              <ScrapedJobCard key={i} job={job} />
            ))}

            <Pagination
              sx={{ mt: 3 }}
              count={totalPages}
              page={currentPage}
              onChange={(e, v) => handleScrape(v)}
            />
          </>
        )}
      </Container>

      <AddApplicationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveApplication}
        application={editingApplication}
        initialDate={initialDate}
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
