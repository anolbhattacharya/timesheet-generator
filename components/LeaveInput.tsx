'use client';

import { EmployeeLeaveMap } from '@/types';
import { EMPLOYEES } from '@/lib/employees';
import EmployeeCard from './EmployeeCard';

interface LeaveInputProps {
  dates: string[];
  leaveMap: EmployeeLeaveMap;
  onToggleLeave: (employeeId: string, date: string) => void;
  onClearAll: () => void;
  getDayInfo: (date: string) => {
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
  };
}

export default function LeaveInput({
  dates,
  leaveMap,
  onToggleLeave,
  onClearAll,
  getDayInfo,
}: LeaveInputProps) {
  const totalLeaveDays = Object.values(leaveMap).reduce(
    (sum, days) => sum + days.length,
    0
  );

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-xl text-gray-800">Leave Input</h2>
          <p className="text-sm text-gray-500">
            Click on working days to mark as leave
          </p>
        </div>
        <button
          onClick={onClearAll}
          disabled={totalLeaveDays === 0}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear All ({totalLeaveDays})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMPLOYEES.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            leaveDays={leaveMap[employee.id] || []}
            onToggleLeave={(date) => onToggleLeave(employee.id, date)}
            dates={dates}
            getDayInfo={getDayInfo}
          />
        ))}
      </div>
    </div>
  );
}
