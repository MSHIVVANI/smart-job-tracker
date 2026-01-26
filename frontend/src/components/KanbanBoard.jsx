// frontend/src/components/KanbanBoard.jsx

import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { Box } from '@mui/material';

function KanbanBoard({ columns, data, onDragEnd, onEdit, onDelete }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        p: 2, // Add some padding
        bgcolor: '#e9ebee', // A slightly different background color
        borderRadius: 2,
        minHeight: 600,
      }}>
        {Object.values(columns).map((column) => {
          const tasks = data[column.id] || [];
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks}
              count={tasks.length} // <-- Pass the number of tasks as the count
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </Box>
    </DragDropContext>
  );
}

export default KanbanBoard;