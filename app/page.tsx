'use client';

import { useState, useMemo, useCallback } from 'react';
import { format, parseISO, isWeekend, subDays } from 'date-fns';
import { TimesheetEntry, EmployeeLeaveMap } from '@/types';
import { EMPLOYEES } from '@/lib/employees';
import { isHoliday, getHolidayName } from '@/lib/holidays';
import { generateTimesheet, getDateRange } from '@/lib/generator';
import DateRangePicker from '@/components/DateRangePicker';
import LeaveInput from '@/components/LeaveInput';
import CalendarGrid from '@/components/CalendarGrid';
import TimesheetPreview from '@/components/TimesheetPreview';
import ExportButtons from '@/components/ExportButtons';

function getDefaultDates() {
  const today = new Date();
  const start = subDays(today, 14);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
  };
}

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

  const defaultDates = useMemo(() => getDefaultDates(), []);
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);

  const dates = useMemo(
    () => getDateRange(startDate, endDate),
    [startDate, endDate]
  );

  const handleResetDates = useCallback(() => {
    const defaults = getDefaultDates();
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
  }, []);

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
    setTimeout(() => {
      const newEntries = generateTimesheet(leaveMap, dates);
      setEntries(newEntries);
      setIsGenerating(false);
    }, 300);
  }, [leaveMap, dates]);

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

        {/* Date Range Picker */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={handleResetDates}
        />

        {/* Working Days Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">
              <span className="font-semibold">{workingDaysCount}</span> working
              days in selected range
            </span>
            <span className="text-sm text-blue-600">
              (excludes weekends, holidays, and marked leaves)
            </span>
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
          AI Lab Team Timesheet Generator v1.1
        </footer>
      </div>
    </main>
  );
}
