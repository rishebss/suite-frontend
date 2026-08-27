import React from 'react';
import { useAuth } from '@/context/AuthContext';
import CalendarComponent from '../components/CalendarComponent';

const CalendarPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Calendar</h1>
          <p className="text-sm text-white/40 font-medium">Manage your schedule and events</p>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-10 relative z-10">
        <CalendarComponent />
      </main>
    </div>
  );
};

export default CalendarPage;
