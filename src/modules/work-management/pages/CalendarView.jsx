import React from 'react';
import { useParams } from 'react-router-dom';
import CalendarComponent from '../../calendar/components/CalendarComponent';

const CalendarView = () => {
  const { workspaceId, projectId } = useParams();
  return <CalendarComponent projectId={projectId} workspaceId={workspaceId} />;
};

export default CalendarView;
