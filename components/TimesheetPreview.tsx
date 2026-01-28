'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { TimesheetEntry } from '@/types';
import { EMPLOYEES } from '@/lib/employees';
import { PROJECTS } from '@/lib/projects';

interface TimesheetPreviewProps {
  entries: TimesheetEntry[];
}

type FilterType = 'all' | 'employee' | 'project' | 'date';

export default function TimesheetPreview({ entries }: TimesheetPreviewProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  const filteredEntries = entries.filter((entry) => {
    if (filterType === 'all') return true;
    if (filterType === 'employee' && filterValue) {
      return entry.employeeId === filterValue;
    }
    if (filterType === 'project' && filterValue) {
      return entry.projectCode === filterValue;
    }
    if (filterType === 'date' && filterValue) {
      return entry.date === filterValue;
    }
    return true;
  });

  const uniqueDates = [...new Set(entries.map((e) => e.date))].sort();

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);

  const getProjectColor = (projectCode: string) => {
    switch (projectCode) {
      case 'SPARK':
        return 'bg-spark text-white';
      case 'RADIATE':
        return 'bg-radiate text-white';
      case 'SYNTHPERSONA':
        return 'bg-synthpersona text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
        <p className="text-gray-500">
          No timesheet entries generated yet. Click &quot;Generate Timesheet&quot; to
          create entries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold text-xl text-gray-800">
            Generated Timesheet Preview
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter by:</span>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as FilterType);
                setFilterValue('');
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="employee">Employee</option>
              <option value="project">Project</option>
              <option value="date">Date</option>
            </select>

            {filterType === 'employee' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}

            {filterType === 'project' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                {PROJECTS.map((proj) => (
                  <option key={proj.code} value={proj.code}>
                    {proj.name}
                  </option>
                ))}
              </select>
            )}

            {filterType === 'date' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Date</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {format(parseISO(date), 'MMM d, yyyy')}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredEntries.length} of {entries.length} entries |{' '}
          <span className="font-medium">{totalHours} hours</span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Date</th>
              <th className="text-left p-3 font-medium text-gray-600">
                Employee
              </th>
              <th className="text-left p-3 font-medium text-gray-600">
                Project
              </th>
              <th className="text-left p-3 font-medium text-gray-600">Task</th>
              <th className="text-right p-3 font-medium text-gray-600">Hours</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-800">
                  {format(parseISO(entry.date), 'MMM d')}
                </td>
                <td className="p-3 text-gray-800">{entry.employeeName}</td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getProjectColor(
                      entry.projectCode
                    )}`}
                  >
                    {entry.projectName}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{entry.taskDescription}</td>
                <td className="p-3 text-right font-medium text-gray-800">
                  {entry.hours}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
