import * as XLSX from 'xlsx';
import { TimesheetEntry } from '@/types';
import { EMPLOYEES } from './employees';
import { PROJECTS } from './projects';

interface SummaryRow {
  Employee: string;
  'Total Hours': number;
  [key: string]: string | number;
}

function entriesToRows(entries: TimesheetEntry[]) {
  return entries.map((e) => ({
    Date: e.date,
    Employee: e.employeeName,
    Project: e.projectName,
    'Project Code': e.projectCode,
    Task: e.taskDescription,
    Hours: e.hours,
  }));
}

function generateSummary(entries: TimesheetEntry[]): SummaryRow[] {
  const summary: SummaryRow[] = [];

  for (const employee of EMPLOYEES) {
    const row: SummaryRow = {
      Employee: employee.name,
      'Total Hours': 0,
    };

    for (const project of PROJECTS) {
      const projectHours = entries
        .filter(
          (e) =>
            e.employeeId === employee.id && e.projectCode === project.code
        )
        .reduce((sum, e) => sum + e.hours, 0);
      row[project.name] = projectHours;
      row['Total Hours'] += projectHours;
    }

    summary.push(row);
  }

  // Add total row
  const totalRow: SummaryRow = {
    Employee: 'TOTAL',
    'Total Hours': 0,
  };

  for (const project of PROJECTS) {
    const projectTotal = entries
      .filter((e) => e.projectCode === project.code)
      .reduce((sum, e) => sum + e.hours, 0);
    totalRow[project.name] = projectTotal;
    totalRow['Total Hours'] += projectTotal;
  }

  summary.push(totalRow);

  return summary;
}

export function exportToCSV(entries: TimesheetEntry[]): void {
  const rows = entriesToRows(entries);
  const headers = ['Date', 'Employee', 'Project', 'Project Code', 'Task', 'Hours'];

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const value = row[h as keyof typeof row];
          // Escape quotes and wrap in quotes if contains comma
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, 'timesheet.csv', 'text/csv');
}

export function exportToExcel(entries: TimesheetEntry[]): void {
  const wb = XLSX.utils.book_new();

  // Main timesheet sheet
  const rows = entriesToRows(entries);
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 12 }, // Employee
    { wch: 14 }, // Project
    { wch: 14 }, // Project Code
    { wch: 40 }, // Task
    { wch: 8 },  // Hours
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

  // Summary sheet
  const summary = generateSummary(entries);
  const summaryWs = XLSX.utils.json_to_sheet(summary);

  summaryWs['!cols'] = [
    { wch: 12 }, // Employee
    { wch: 12 }, // Spark
    { wch: 12 }, // Radiate
    { wch: 14 }, // SynthPersona
    { wch: 12 }, // Total Hours
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Generate and download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, 'timesheet.xlsx');
}

export function exportEmployeeToExcel(
  entries: TimesheetEntry[],
  employeeId: string,
  employeeName: string
): void {
  const employeeEntries = entries.filter((e) => e.employeeId === employeeId);
  const wb = XLSX.utils.book_new();

  const rows = entriesToRows(employeeEntries);
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 40 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, employeeName);

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, `timesheet-${employeeName.toLowerCase()}.xlsx`);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
