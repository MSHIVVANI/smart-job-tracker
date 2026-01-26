// frontend/src/components/ApplicationsDataGrid.jsx

import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

function ApplicationsDataGrid({ applications, onEdit, onDelete }) {
  // Define the columns for our data grid
  const columns = [
    { 
      field: 'company', 
      headerName: 'Company', 
      flex: 1, // flex: 1 allows the column to grow
    },
    { 
      field: 'roleTitle', 
      headerName: 'Role Title', 
      flex: 2, 
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      flex: 1,
      // Use a valueGetter to format the date
      valueGetter: (value) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      // Render custom buttons in the "Actions" column
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => onEdit(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => onDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={applications}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
    </Box>
  );
}

export default ApplicationsDataGrid;