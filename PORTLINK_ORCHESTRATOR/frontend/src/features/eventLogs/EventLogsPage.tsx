import { useState } from 'react';
import { EventLogList } from './EventLogList';
import EventLogDetailModal from './EventLogDetailModal';
import type { EventLog } from './eventLogsSlice';
import { useAppDispatch } from '@/store/hooks';
import { deleteEventLog } from './eventLogsSlice';
import { useNotification } from '@/hooks/useNotification';

/**
 * Event Logs Page Component
 * 
 * Displays system audit trail and event history
 */
export default function EventLogsPage() {
  const dispatch = useAppDispatch();
  const { success, error } = useNotification();
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewLog = (eventLog: EventLog) => {
    setSelectedLog(eventLog);
    setDetailModalOpen(true);
  };

  const handleDeleteLog = async (eventLogId: string) => {
    try {
      await dispatch(deleteEventLog(eventLogId)).unwrap();
      success('Event log deleted successfully');
    } catch (err) {
      error('Failed to delete event log');
      console.error('Delete event log error:', err);
    }
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <>
      <EventLogList
        onView={handleViewLog}
        onDelete={handleDeleteLog}
      />

      {selectedLog && (
        <EventLogDetailModal
          eventLog={selectedLog}
          open={detailModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
