import { useState } from 'react';
import { ConflictList } from './ConflictList';
import ConflictDetailModal from './ConflictDetailModal';
import type { Conflict } from './conflictsSlice';
import { useAppDispatch } from '@/store/hooks';
import { resolveConflict, deleteConflict } from './conflictsSlice';
import { useNotification } from '@/hooks/useNotification';

/**
 * Conflicts Page Component
 * 
 * Manages conflict detection, viewing, and resolution
 */
export default function ConflictsPage() {
  const dispatch = useAppDispatch();
  const { success, error } = useNotification();
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewConflict = (conflict: Conflict) => {
    setSelectedConflict(conflict);
    setDetailModalOpen(true);
  };

  const handleResolveConflict = async (conflictId: string) => {
    try {
      await dispatch(resolveConflict({ id: conflictId })).unwrap();
      success('Conflict resolved successfully');
    } catch (err) {
      error('Failed to resolve conflict');
      console.error('Resolve conflict error:', err);
    }
  };

  const handleDeleteConflict = async (conflictId: string) => {
    try {
      await dispatch(deleteConflict(conflictId)).unwrap();
      success('Conflict deleted successfully');
    } catch (err) {
      error('Failed to delete conflict');
      console.error('Delete conflict error:', err);
    }
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedConflict(null);
  };

  return (
    <>
      <ConflictList
        onView={handleViewConflict}
        onResolve={handleResolveConflict}
        onDelete={handleDeleteConflict}
      />

      {selectedConflict && (
        <ConflictDetailModal
          conflict={selectedConflict}
          open={detailModalOpen}
          onClose={handleCloseModal}
          onResolve={handleResolveConflict}
        />
      )}
    </>
  );
}
