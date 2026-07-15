import { format, subDays, isWeekend, parseISO, eachDayOfInterval } from 'date-fns';
import {
  TimesheetEntry,
  EmployeeLeaveMap,
  DayStatus,
  CostType,
  Employee,
  Project,
  TaskCategory,
} from '@/types';
import { EMPLOYEES } from './employees';
import { PROJECTS } from './projects';
import { isHoliday, getHolidayName } from './holidays';

// Capitalisation policy: the share of hours capitalised as intellectual property
// (AASB 138.57) varies month to month within this range; the rest is OpEx expensed
// as incurred. CapEx 65-72%  <=>  OpEx 28-35%.
export const CAPEX_RATIO_MIN = 0.65;
export const CAPEX_RATIO_MAX = 0.72;

// Each calendar month gets its own CapEx target somewhere in the policy range.
function pickMonthlyCapexRatio(): number {
  return CAPEX_RATIO_MIN + Math.random() * (CAPEX_RATIO_MAX - CAPEX_RATIO_MIN);
}

function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

function getRandomTask(tasks: TaskCategory[], costType: CostType): string {
  const pool = tasks.filter((t) => t.costType === costType);
  const list = pool.length > 0 ? pool : tasks;
  return list[Math.floor(Math.random() * list.length)].description;
}

function getRandomDailyHours(): number {
  // Random hours between 7.5 and 14, rounded to 0.5
  const minHours = 7.5;
  const maxHours = 14;
  return roundToHalf(minHours + Math.random() * (maxHours - minHours));
}

// Split a total (a multiple of 0.5) across weights, keeping every part a multiple of
// 0.5 and guaranteeing the parts sum back to the total (largest-remainder method).
function splitHoursByWeights(total: number, weights: number[]): number[] {
  const totalUnits = Math.round(total / 0.5); // work in half-hour units
  const raw = weights.map((w) => w * totalUnits);
  const units = raw.map((r) => Math.floor(r));
  let remainder = totalUnits - units.reduce((a, b) => a + b, 0);

  // Hand out the leftover half-hours to the parts with the largest fractional remainder.
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; remainder > 0; k++, remainder--) {
    units[order[k % order.length].i] += 1;
  }
  return units.map((u) => u * 0.5);
}

export function getLast15Days(endDate: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = 14; i >= 0; i--) {
    const date = subDays(endDate, i);
    days.push(format(date, 'yyyy-MM-dd'));
  }
  return days;
}

export function getDateRange(startDate: string, endDate: string): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });
  return days.map((d) => format(d, 'yyyy-MM-dd'));
}

export function getDayStatus(
  dateStr: string,
  employeeId: string,
  leaveMap: EmployeeLeaveMap
): DayStatus {
  const date = parseISO(dateStr);
  const isWeekendDay = isWeekend(date);
  const isHolidayDay = isHoliday(dateStr);
  const holidayName = getHolidayName(dateStr);
  const isLeaveDay = leaveMap[employeeId]?.includes(dateStr) || false;

  return {
    date: dateStr,
    isWeekend: isWeekendDay,
    isHoliday: isHolidayDay,
    holidayName,
    isLeave: isLeaveDay,
  };
}

export function isWorkingDay(
  dateStr: string,
  employeeId: string,
  leaveMap: EmployeeLeaveMap
): boolean {
  const status = getDayStatus(dateStr, employeeId, leaveMap);
  return !status.isWeekend && !status.isHoliday && !status.isLeave;
}

function makeEntry(
  employee: Employee,
  dateStr: string,
  project: Project,
  costType: CostType,
  hours: number
): TimesheetEntry {
  return {
    id: `${employee.id}-${dateStr}-${project.code}-${costType}`,
    employeeId: employee.id,
    employeeName: employee.name,
    date: dateStr,
    projectCode: project.code,
    projectName: project.name,
    taskDescription: getRandomTask(employee.tasks, costType),
    costType,
    hours,
  };
}

export function generateTimesheet(
  leaveMap: EmployeeLeaveMap,
  dates: string[]
): TimesheetEntry[] {
  const entries: TimesheetEntry[] = [];
  const weights = PROJECTS.map((p) => p.allocationWeight);

  // Per-month CapEx target (varies within the policy range) and a per-month rounding
  // residual so each month's CapEx total converges on its own target rather than
  // rounding independently (and biasing) on each small chunk.
  const monthTarget: Record<string, number> = {};
  const monthCarry: Record<string, number> = {};

  for (const employee of EMPLOYEES) {
    for (const dateStr of dates) {
      if (!isWorkingDay(dateStr, employee.id, leaveMap)) {
        continue;
      }

      const month = dateStr.slice(0, 7); // YYYY-MM
      if (monthTarget[month] === undefined) {
        monthTarget[month] = pickMonthlyCapexRatio();
        monthCarry[month] = 0;
      }
      const capexRatio = monthTarget[month];

      const dailyTotal = getRandomDailyHours();
      const projectHours = splitHoursByWeights(dailyTotal, weights);

      PROJECTS.forEach((project, idx) => {
        const chunk = projectHours[idx];
        if (chunk <= 0) return;

        // Divide the project's hours into CAPEX / OPEX, carrying the residual forward.
        const idealCapex = chunk * capexRatio + monthCarry[month];
        const maxHalves = Math.round(chunk / 0.5);
        let capexHalves = Math.round(idealCapex / 0.5);
        if (capexHalves < 0) capexHalves = 0;
        if (capexHalves > maxHalves) capexHalves = maxHalves;

        const capexHours = capexHalves * 0.5;
        monthCarry[month] = idealCapex - capexHours;
        const opexHours = chunk - capexHours;

        if (capexHours > 0) {
          entries.push(makeEntry(employee, dateStr, project, 'CAPEX', capexHours));
        }
        if (opexHours > 0) {
          entries.push(makeEntry(employee, dateStr, project, 'OPEX', opexHours));
        }
      });
    }
  }

  // Sort by date, then employee, then project, then cost type
  entries.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.employeeName !== b.employeeName)
      return a.employeeName.localeCompare(b.employeeName);
    if (a.projectName !== b.projectName)
      return a.projectName.localeCompare(b.projectName);
    return a.costType.localeCompare(b.costType);
  });

  return entries;
}

export function getEntriesByEmployee(
  entries: TimesheetEntry[],
  employeeId: string
): TimesheetEntry[] {
  return entries.filter((e) => e.employeeId === employeeId);
}

export function getTotalHoursByEmployee(
  entries: TimesheetEntry[],
  employeeId: string
): number {
  return getEntriesByEmployee(entries, employeeId).reduce(
    (sum, e) => sum + e.hours,
    0
  );
}

export function getTotalHoursByProject(
  entries: TimesheetEntry[],
  projectCode: string
): number {
  return entries
    .filter((e) => e.projectCode === projectCode)
    .reduce((sum, e) => sum + e.hours, 0);
}

export function getTotalHoursByCostType(
  entries: TimesheetEntry[],
  costType: CostType
): number {
  return entries
    .filter((e) => e.costType === costType)
    .reduce((sum, e) => sum + e.hours, 0);
}
