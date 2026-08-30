import React from 'react';
import { ColumnDiffGroup } from '../types/schema';
import { DiffTable } from './DiffTable';

interface ReviewDiffStepProps {
  columnDiffs: Record<string, ColumnDiffGroup>;
  onToggleColumnStatus: (column: string, status: 'accepted' | 'rejected') => void;
}

export const ReviewDiffStep: React.FC<ReviewDiffStepProps> = ({
  columnDiffs,
  onToggleColumnStatus,
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <DiffTable
        columnDiffs={columnDiffs}
        onToggleColumnStatus={onToggleColumnStatus}
      />
    </div>
  );
};
