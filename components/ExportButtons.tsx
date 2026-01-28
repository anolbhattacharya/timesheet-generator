'use client';

import { useState } from 'react';
import { TimesheetEntry } from '@/types';
import { EMPLOYEES } from '@/lib/employees';
import { exportToCSV, exportToExcel, exportEmployeeToExcel } from '@/lib/export';

interface ExportButtonsProps {
  entries: TimesheetEntry[];
}

export default function ExportButtons({ entries }: ExportButtonsProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(entries);
  };

  const handleExportExcel = () => {
    exportToExcel(entries);
  };

  const handleExportEmployee = (employeeId: string, employeeName: string) => {
    exportEmployeeToExcel(entries, employeeId, employeeName);
    setShowDropdown(false);
  };

  const isDisabled = entries.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleExportCSV}
        disabled={isDisabled}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        Download CSV
      </button>

      <button
        onClick={handleExportExcel}
        disabled={isDisabled}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        Download Excel
      </button>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isDisabled}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          Download by Employee
          <svg
            className={`w-4 h-4 transition-transform ${
              showDropdown ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showDropdown && !isDisabled && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[150px]">
            {EMPLOYEES.map((emp) => (
              <button
                key={emp.id}
                onClick={() => handleExportEmployee(emp.id, emp.name)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {emp.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
