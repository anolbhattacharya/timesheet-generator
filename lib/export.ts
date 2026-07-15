import * as XLSX from 'xlsx';
import { TimesheetEntry } from '@/types';
import { EMPLOYEES } from './employees';
import { PROJECTS } from './projects';
import { CAPEX_RATIO } from './generator';

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

// Short label used in the tagged "Type" column, matching the finance workbook.
function typeLabel(costType: 'CAPEX' | 'OPEX'): 'CapEx' | 'OpEx' {
  return costType === 'CAPEX' ? 'CapEx' : 'OpEx';
}

function sortEntries(a: TimesheetEntry, b: TimesheetEntry): number {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  if (a.employeeName !== b.employeeName)
    return a.employeeName.localeCompare(b.employeeName);
  if (a.projectName !== b.projectName)
    return a.projectName.localeCompare(b.projectName);
  return a.costType.localeCompare(b.costType); // CAPEX before OPEX
}

function sumHours(list: TimesheetEntry[]): number {
  return round2(list.reduce((s, e) => s + e.hours, 0));
}

/**
 * Finance-ready workbook that automatically tags, sorts and summarises every entry
 * by CapEx (capitalised IP) vs OpEx. Mirrors the AI Labs FY26 analysis format:
 *   1. "CapEx vs OpEx" — classification / project / task breakdowns with percentages
 *   2. "Split"         — all entries tagged with a Type column, sorted
 *   3. "Raw Data"      — the same entries untagged (plain timesheet)
 *   4. "Summary"       — Employee x Product hours
 */
export function exportAnalysisToExcel(entries: TimesheetEntry[]): void {
  const wb = XLSX.utils.book_new();
  const sorted = [...entries].sort(sortEntries);

  const total = sumHours(entries);
  const capex = sumHours(entries.filter((e) => e.costType === 'CAPEX'));
  const opex = sumHours(entries.filter((e) => e.costType === 'OPEX'));

  const dates = entries.map((e) => e.date).sort();
  const rangeLabel =
    dates.length > 0 ? `${dates[0]} to ${dates[dates.length - 1]}` : 'no data';
  const policyPct = Math.round(CAPEX_RATIO * 1000) / 10; // e.g. 68
  const opexPolicyPct = Math.round((1 - CAPEX_RATIO) * 1000) / 10; // e.g. 32

  // ---------- Sheet 1: CapEx vs OpEx analysis ----------
  const aoa: (string | number)[][] = [];
  const pctCells: string[] = [];
  const addRow = (row: (string | number)[]) => aoa.push(row);
  // mark a column in the row just pushed as a percentage-formatted cell
  const markPct = (col: number) =>
    pctCells.push(XLSX.utils.encode_cell({ r: aoa.length - 1, c: col }));

  addRow([
    `AI Lab Timesheet — CapEx (IP) vs OpEx Analysis (${policyPct} / ${opexPolicyPct} Capitalisation Policy)`,
  ]);
  addRow([
    `Management policy: ${policyPct}% of AI Lab development effort is capitalised as IP (AASB 138), ${opexPolicyPct}% expensed as OpEx. Covers ${rangeLabel}.`,
  ]);
  addRow([]);
  addRow(['Target Capitalisation Rate', CAPEX_RATIO]);
  markPct(1);
  addRow([]);

  addRow(['Hours by Classification']);
  addRow(['Classification', 'Hours', '% of Total']);
  addRow(['CapEx (IP)', capex, total > 0 ? capex / total : 0]);
  markPct(2);
  addRow(['OpEx', opex, total > 0 ? opex / total : 0]);
  markPct(2);
  addRow(['TOTAL', total, total > 0 ? 1 : 0]);
  markPct(2);
  addRow([]);
  addRow([]);

  addRow(['Hours by Project and Classification']);
  addRow(['Project', 'CapEx (IP)', 'OpEx', 'Total', 'CapEx %']);
  for (const project of PROJECTS) {
    const projEntries = entries.filter((e) => e.projectCode === project.code);
    const pCap = sumHours(projEntries.filter((e) => e.costType === 'CAPEX'));
    const pOpex = sumHours(projEntries.filter((e) => e.costType === 'OPEX'));
    const pTotal = round2(pCap + pOpex);
    addRow([project.name, pCap, pOpex, pTotal, pTotal > 0 ? pCap / pTotal : 0]);
    markPct(4);
  }
  addRow(['TOTAL', capex, opex, total, total > 0 ? capex / total : 0]);
  markPct(4);
  addRow([]);
  addRow([]);

  addRow(['Hours by Task and Classification']);
  addRow(['Task', 'CapEx (IP)', 'OpEx', 'Total']);
  const taskNames = Array.from(
    new Set(entries.map((e) => e.taskDescription))
  ).sort();
  for (const task of taskNames) {
    const taskEntries = entries.filter((e) => e.taskDescription === task);
    const tCap = sumHours(taskEntries.filter((e) => e.costType === 'CAPEX'));
    const tOpex = sumHours(taskEntries.filter((e) => e.costType === 'OPEX'));
    addRow([task, tCap, tOpex, round2(tCap + tOpex)]);
  }
  addRow(['TOTAL', capex, opex, total]);

  const analysisWs = XLSX.utils.aoa_to_sheet(aoa);
  pctCells.forEach((addr) => {
    if (analysisWs[addr]) analysisWs[addr].z = '0.0%';
  });
  analysisWs['!cols'] = [
    { wch: 44 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, analysisWs, 'CapEx vs OpEx');

  // ---------- Sheet 2: Split (tagged + sorted) ----------
  const splitRows = sorted.map((e) => ({
    Date: e.date,
    Employee: e.employeeName,
    Project: e.projectName,
    'Project Code': e.projectCode,
    Task: e.taskDescription,
    Hours: e.hours,
    Type: typeLabel(e.costType),
  }));
  const splitWs = XLSX.utils.json_to_sheet(splitRows);
  splitWs['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 42 },
    { wch: 8 },
    { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, splitWs, 'Split');

  // ---------- Sheet 3: Raw Data (untagged) ----------
  const rawRows = sorted.map((e) => ({
    Date: e.date,
    Employee: e.employeeName,
    Project: e.projectName,
    'Project Code': e.projectCode,
    Task: e.taskDescription,
    Hours: e.hours,
  }));
  const rawWs = XLSX.utils.json_to_sheet(rawRows);
  rawWs['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 42 },
    { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, rawWs, 'Raw Data');

  // ---------- Sheet 4: Summary (Employee x Product) ----------
  const summary = generateProjectSummary(entries);
  const summaryWs = XLSX.utils.json_to_sheet(summary, {
    header: ['Employee', 'Total Hours', ...PROJECTS.map((p) => p.name)],
  });
  summaryWs['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    ...PROJECTS.map(() => ({ wch: 12 })),
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, 'timesheet-capex-opex-analysis.xlsx');
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
