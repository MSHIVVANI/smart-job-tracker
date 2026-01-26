import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import { useMemo } from 'react';
import { Tooltip, Box, Popover, Typography, List, ListItem, ListItemText } from '@mui/material';

// 4️⃣ Status → Color Mapping (STRICT)
const statusColors = {
  Accepted: '#009688',     // Teal
  Offer: '#4caf50',        // Green
  Interviewing: '#ffc107', // Amber
  FollowUp: '#9c27b0',     // Purple
  Applied: '#2196f3',      // Blue
  Discovered: '#9e9e9e',   // Grey
  Rejected: '#f44336',     // Red
};

// Custom component to render events
const EventContent = ({ event, view }) => {
  const { title } = event;
  const { status, notes } = event.extendedProps;
  const backgroundColor = statusColors[status] || '#75757e';
  const eventClassName = status === 'Rejected' ? 'event-rejected' : '';

  if (view.type === 'multiMonthYear') {
    return (
      <Tooltip title={title} placement="top">
        <div className={`event-dot ${eventClassName}`} style={{ backgroundColor }} />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={<Box><div>{title}</div>{notes && <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Notes: {notes.substring(0, 100)}...</div>}</Box>} placement="top">
      <div className={`fc-event-main ${eventClassName}`} style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor, borderColor: backgroundColor, color: 'white', padding: '2px 4px', borderRadius: '4px' }}>
        {title}
      </div>
    </Tooltip>
  );
};

function ApplicationsCalendar({ applications, onEventClick, onDateClick }) {
  // YOUR CORRECTED LOGIC: Map every application using a fallback date.
  const events = useMemo(() => {
    if (!applications) return [];
    return applications.map(app => {
      const eventDate = app.interviewDate || app.offerDeadline || app.followUpDate || app.updatedAt;
      let eventTitle = `${app.roleTitle} @ ${app.company}`;

      if (app.interviewDate) eventTitle = `Interview: ${app.company}`;
      else if (app.offerDeadline) eventTitle = `Deadline: ${app.company}`;
      else if (app.followUpDate) eventTitle = `Follow-up: ${app.company}`;

      return {
        id: app.id,
        title: eventTitle,
        start: eventDate,
        allDay: true,
        backgroundColor: statusColors[app.status] || '#75757e',
        borderColor: statusColors[app.status] || '#75757e',
        extendedProps: { application: app, status: app.status, notes: app.notes },
      };
    });
  }, [applications]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
      initialView="multiMonthYear" 
      headerToolbar={{ left: 'prev,next', center: 'title', right: 'dayGridMonth,multiMonthYear' }}
      height="750px"
      events={events}
      eventClick={(info) => onEventClick(info.event.extendedProps.application)}
      dateClick={(arg) => onDateClick(arg.dateStr)}
      eventContent={(arg) => <EventContent {...arg} />}
      // 2️⃣ Intelligent Multi-Event Layout
      dayMaxEvents={3} // Automatically creates a "+N more" link in month view
    />
  );
}

export default ApplicationsCalendar;