'use client';

import { format, parseISO } from 'date-fns';
import { EmployeeLeaveMap, DayStatus } from '@/types';
import { EMPLOYEES } from '@/lib/employees';

interface CalendarGridProps {
  dates: string[];
  leaveMap: EmployeeLeaveMap;
  getDayInfo: (date: string) => {
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
  };
}

export default function CalendarGrid({
  dates,
  leaveMap,
  getDayInfo,
}: CalendarGridProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-800 mb-4">
        15-Day Calendar View
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 border-b font-medium text-gray-600">
                Date
              </th>
              <th className="text-left p-2 border-b font-medium text-gray-600">
                Day
              </th>
              {EMPLOYEES.map((emp) => (
                <th
                  key={emp.id}
                  className="text-center p-2 border-b font-medium text-gray-600"
                >
                  {emp.name}
                </th>
              ))}
              <th className="text-left p-2 border-b font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const dayInfo = getDayInfo(date);
              const parsedDate = parseISO(date);
              const dayName = format(parsedDate, 'EEE');
              const displayDate = format(parsedDate, 'MMM d');

              let rowBg = '';
              let statusText = 'Working';
              let statusColor = 'text-working';

              if (dayInfo.isWeekend) {
                rowBg = 'bg-gray-50';
                statusText = 'Weekend';
                statusColor = 'text-weekend';
              } else if (dayInfo.isHoliday) {
                rowBg = 'bg-orange-50';
                statusText = dayInfo.holidayName || 'Holiday';
                statusColor = 'text-holiday';
              }

              return (
                <tr key={date} className={rowBg}>
                  <td className="p-2 border-b text-gray-800">{displayDate}</td>
                  <td className="p-2 border-b text-gray-600">{dayName}</td>
                  {EMPLOYEES.map((emp) => {
                    const isOnLeave = leaveMap[emp.id]?.includes(date);
                    const isWorkDay = !dayInfo.isWeekend && !dayInfo.isHoliday;

                    return (
                      <td key={emp.id} className="text-center p-2 border-b">
                        {!isWorkDay ? (
                          <span className="inline-block w-6 h-6 rounded bg-gray-200"></span>
                        ) : isOnLeave ? (
                          <span
                            className="inline-block w-6 h-6 rounded bg-leave"
                            title="On Leave"
                          ></span>
                        ) : (
                          <span
                            className="inline-block w-6 h-6 rounded bg-working"
                            title="Working"
                          ></span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`p-2 border-b font-medium ${statusColor}`}>
                    {statusText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-working"></span>
          <span className="text-gray-600">Working</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-weekend"></span>
          <span className="text-gray-600">Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-holiday"></span>
          <span className="text-gray-600">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-leave"></span>
          <span className="text-gray-600">Leave</span>
        </div>
      </div>
    </div>
  );
}
