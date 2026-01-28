'use client';

import { format, parseISO } from 'date-fns';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: DateRangePickerProps) {
  const startDateObj = parseISO(startDate);
  const endDateObj = parseISO(endDate);
  const daysDiff = Math.ceil(
    (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm text-gray-500 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              max={endDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm text-gray-500 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              min={startDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="self-end">
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset to Last 15 Days
            </button>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-500">Report Period: </span>
          <span className="font-medium text-gray-800">
            {format(startDateObj, 'MMM d, yyyy')} to{' '}
            {format(endDateObj, 'MMM d, yyyy')}
          </span>
          <span className="text-gray-400 ml-2">({daysDiff} days)</span>
        </div>
      </div>
    </div>
  );
}
