'use client';

import { Employee } from '@/types';

interface EmployeeCardProps {
  employee: Employee;
  leaveDays: string[];
  onToggleLeave: (date: string) => void;
  dates: string[];
  getDayInfo: (date: string) => {
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
  };
}

export default function EmployeeCard({
  employee,
  leaveDays,
  onToggleLeave,
  dates,
  getDayInfo,
}: EmployeeCardProps) {
  const leaveCount = leaveDays.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{employee.name}</h3>
          <p className="text-sm text-gray-500">{employee.role}</p>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-leave">{leaveCount}</span>
          <p className="text-xs text-gray-500">leave days</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {dates.map((date) => {
          const dayInfo = getDayInfo(date);
          const isLeave = leaveDays.includes(date);
          const isClickable = !dayInfo.isWeekend && !dayInfo.isHoliday;
          const dayNum = new Date(date).getDate();

          let bgColor = 'bg-working';
          let textColor = 'text-white';
          let title = 'Working day - click to mark leave';

          if (dayInfo.isWeekend) {
            bgColor = 'bg-weekend';
            title = 'Weekend';
          } else if (dayInfo.isHoliday) {
            bgColor = 'bg-holiday';
            title = dayInfo.holidayName || 'Holiday';
          } else if (isLeave) {
            bgColor = 'bg-leave';
            title = 'Leave - click to remove';
          }

          return (
            <button
              key={date}
              onClick={() => isClickable && onToggleLeave(date)}
              disabled={!isClickable}
              className={`w-8 h-8 rounded text-xs font-medium ${bgColor} ${textColor} ${
                isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-70'
              } transition-opacity`}
              title={`${date}\n${title}`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {employee.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
