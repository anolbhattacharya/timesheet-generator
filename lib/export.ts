import * as XLSX from 'xlsx';
import { TimesheetEntry } from '@/types';
import { EMPLOYEES } from './employees';
import { PROJECTS } from './projects';

interface SummaryRow {
  Employee: string;
  'Total Hours': number;
  [key: string]: string | number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function entriesToRows(entries: TimesheetEntry[]) {
  return entries.map((e) => ({
    Date: e.date,
    Employee: e.employeeName,
    Project: e.projectName,
    'Project Code': e.projectCode,
    Task: e.taskDescription,
    'Cost Type': e.costType === 'CAPEX' ? 'Capitalised (IP)' : 'OpEx',
    Hours: e.hours,
  }));
}

// Per-employee hours split by product (Spark / Radiate / Ember), plus a TOTAL row.
function generateProjectSummary(entries: TimesheetEntry[]): SummaryRow[] {
  const summary: SummaryRow[] = [];

  for (const employee of EMPLOYEES) {
    const row: SummaryRow = { Employee: employee.name, 'Total Hours': 0 };
    for (const project of PROJECTS) {
      const projectHours = entries
        .filter(
          (e) => e.employeeId === employee.id && e.projectCode === project.code
        )
        .reduce((sum, e) => sum + e.hours, 0);
      row[project.name] = projectHours;
      row['Total Hours'] += projectHours;
    }
    summary.push(row);
  }

  const totalRow: SummaryRow = { Employee: 'TOTAL', 'Total Hours': 0 };
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

// Per-employee CAPEX / OPEX split for the IP-capitalisation view (AASB 138), with a
// TOTAL row and the capitalised percentage of each person's hours.
function generateCapitalisationSummary(entries: TimesheetEntry[]) {
  const rows: Record<string, string | number>[] = [];

  const buildRow = (label: string, subset: TimesheetEntry[]) => {
    const capex = subset
      .filter((e) => e.costType === 'CAPEX')
      .reduce((s, e) => s + e.hours, 0);
    const opex = subset
      .filter((e) => e.costType === 'OPEX')
      .reduce((s, e) => s + e.hours, 0);
    const total = capex + opex;
    return {
      Employee: label,
      'Capitalised (IP) Hours': round2(capex),
      'OpEx Hours': round2(opex),
      'Total Hours': round2(total),
      'Capitalised %': total > 0 ? `${round2((capex / total) * 100)}%` : '0%',
      'OpEx %': total > 0 ? `${round2((opex / total) * 100)}%` : '0%',
    };
  };

  for (const employee of EMPLOYEES) {
    rows.push(
      buildRow(
        employee.name,
        entries.filter((e) => e.employeeId === employee.id)
      )
    );
  }
  rows.push(buildRow('TOTAL', entries));

  return rows;
}

export function exportToCSV(entries: TimesheetEntry[]): void {
  const rows = entriesToRows(entries);
  const headers = [
    'Date',
    'Employee',
    'Project',
    'Project Code',
    'Task',
    'Cost Type',
    'Hours',
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const value = row[h as keyof typeof row];
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
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 12 }, // Employee
    { wch: 14 }, // Project
    { wch: 14 }, // Project Code
    { wch: 40 }, // Task
    { wch: 18 }, // Cost Type
    { wch: 8 }, // Hours
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

  // Product summary sheet
  const summary = generateProjectSummary(entries);
  const summaryWs = XLSX.utils.json_to_sheet(summary);
  summaryWs['!cols'] = [
    { wch: 14 }, // Employee
    { wch: 12 }, // Total Hours
    ...PROJECTS.map(() => ({ wch: 12 })),
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Product Summary');

  // IP capitalisation summary sheet
  const capSummary = generateCapitalisationSummary(entries);
  const capWs = XLSX.utils.json_to_sheet(capSummary);
  capWs['!cols'] = [
    { wch: 14 }, // Employee
    { wch: 20 }, // Capitalised Hours
    { wch: 12 }, // OpEx Hours
    { wch: 12 }, // Total Hours
    { wch: 14 }, // Capitalised %
    { wch: 10 }, // OpEx %
  ];
  XLSX.utils.book_append_sheet(wb, capWs, 'IP Capitalisation');

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
    { wch: 18 },
    { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, employeeName);

  // Per-employee capitalisation snapshot
  const capSummary = generateCapitalisationSummary(employeeEntries).filter(
    (r) => r.Employee === employeeName
  );
  if (capSummary.length > 0) {
    const capWs = XLSX.utils.json_to_sheet(capSummary);
    capWs['!cols'] = [
      { wch: 14 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, capWs, 'IP Capitalisation');
  }

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
