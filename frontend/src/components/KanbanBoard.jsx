import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { Box } from '@mui/material';

function KanbanBoard({ columns, data, onDragEnd, onEdit, onDelete }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', overflowX: 'auto', p: 1 }}>
        {Object.values(columns).map((column) => {
          const tasks = data[column.id] || [];
          return (
            <KanbanColumn
              key={column.id} column={column} tasks={tasks}
              onEdit={onEdit} onDelete={onDelete}
            />
          );
        })}
      </Box>
    </DragDropContext>
  );
}
export default KanbanBoard;