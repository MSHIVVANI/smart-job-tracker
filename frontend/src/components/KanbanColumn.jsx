import { Droppable, Draggable } from '@hello-pangea/dnd';
import ApplicationCard from './ApplicationCard';
import { Box, Typography, Paper } from '@mui/material';

function KanbanColumn({ column, tasks, onEdit, onDelete }) {
  return (
    <Paper sx={{ width: 300, minWidth: 300, mx: 1, p: 2, backgroundColor: '#f4f6f8' }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>{column.title}</Typography>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef} {...provided.droppableProps}
            sx={{ minHeight: '500px', transition: 'background-color 0.2s ease', backgroundColor: snapshot.isDraggingOver ? '#e0e0e0' : 'transparent' }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <ApplicationCard application={task} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}
export default KanbanColumn;