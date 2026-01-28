'use client';

import { useState, useMemo, useCallback } from 'react';
import { format, parseISO, isWeekend } from 'date-fns';
import { TimesheetEntry, EmployeeLeaveMap } from '@/types';
import { EMPLOYEES } from '@/lib/employees';
import { isHoliday, getHolidayName } from '@/lib/holidays';
import { generateTimesheet, getLast15Days } from '@/lib/generator';
import LeaveInput from '@/components/LeaveInput';
import CalendarGrid from '@/components/CalendarGrid';
import TimesheetPreview from '@/components/TimesheetPreview';
import ExportButtons from '@/components/ExportButtons';

export default function Home() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [leaveMap, setLeaveMap] = useState<EmployeeLeaveMap>(() => {
    const map: EmployeeLeaveMap = {};
    EMPLOYEES.forEach((emp) => {
      map[emp.id] = [];
    });
    return map;
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const dates = useMemo(() => getLast15Days(), []);

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const getDayInfo = useCallback((date: string) => {
    const parsedDate = parseISO(date);
    return {
      isWeekend: isWeekend(parsedDate),
      isHoliday: isHoliday(date),
      holidayName: getHolidayName(date),
    };
  }, []);

  const handleToggleLeave = useCallback(
    (employeeId: string, date: string) => {
      setLeaveMap((prev) => {
        const currentLeaves = prev[employeeId] || [];
        const isCurrentlyOnLeave = currentLeaves.includes(date);

        return {
          ...prev,
          [employeeId]: isCurrentlyOnLeave
            ? currentLeaves.filter((d) => d !== date)
            : [...currentLeaves, date],
        };
      });
    },
    []
  );

  const handleClearAllLeaves = useCallback(() => {
    const clearedMap: EmployeeLeaveMap = {};
    EMPLOYEES.forEach((emp) => {
      clearedMap[emp.id] = [];
    });
    setLeaveMap(clearedMap);
  }, []);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    // Small delay to show loading state
    setTimeout(() => {
      const newEntries = generateTimesheet(leaveMap);
      setEntries(newEntries);
      setIsGenerating(false);
    }, 300);
  }, [leaveMap]);

  const workingDaysCount = useMemo(() => {
    return dates.filter((date) => {
      const info = getDayInfo(date);
      return !info.isWeekend && !info.isHoliday;
    }).length;
  }, [dates, getDayInfo]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              AI Lab Timesheet Generator
            </h1>
            <p className="text-gray-500 mt-1">
              Generate randomised timesheet entries for the team
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
          >
            {isGenerating ? 'Generating...' : 'Generate Timesheet'}
          </button>
        </div>

        {/* Report Period Info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-gray-500">Report Period:</span>{' '}
              <span className="font-medium text-gray-800">
                {format(parseISO(startDate), 'MMM d, yyyy')} to{' '}
                {format(parseISO(endDate), 'MMM d, yyyy')}
              </span>
              <span className="text-gray-400 ml-2">(15 days)</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-working">{workingDaysCount}</span>{' '}
              working days
            </div>
          </div>
        </div>

        {/* Leave Input Section */}
        <div className="mb-6">
          <LeaveInput
            dates={dates}
            leaveMap={leaveMap}
            onToggleLeave={handleToggleLeave}
            onClearAll={handleClearAllLeaves}
            getDayInfo={getDayInfo}
          />
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          <CalendarGrid
            dates={dates}
            leaveMap={leaveMap}
            getDayInfo={getDayInfo}
          />
        </div>

        {/* Timesheet Preview */}
        <div className="mb-6">
          <TimesheetPreview entries={entries} />
        </div>

        {/* Export Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">
            Export Options
          </h3>
          <ExportButtons entries={entries} />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-400">
          AI Lab Team Timesheet Generator v1.0
        </footer>
      </div>
    </main>
  );
}
