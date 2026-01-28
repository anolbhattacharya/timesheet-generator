import { format, subDays, isWeekend, parseISO } from 'date-fns';
import { TimesheetEntry, EmployeeLeaveMap, DayStatus } from '@/types';
import { EMPLOYEES } from './employees';
import { PROJECTS } from './projects';
import { isHoliday, getHolidayName } from './holidays';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTask(taskCategories: string[]): string {
  return taskCategories[Math.floor(Math.random() * taskCategories.length)];
}

export function getLast15Days(endDate: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = 14; i >= 0; i--) {
    const date = subDays(endDate, i);
    days.push(format(date, 'yyyy-MM-dd'));
  }
  return days;
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

export function generateTimesheet(
  leaveMap: EmployeeLeaveMap,
  endDate: Date = new Date()
): TimesheetEntry[] {
  const entries: TimesheetEntry[] = [];
  const days = getLast15Days(endDate);

  for (const employee of EMPLOYEES) {
    for (const dateStr of days) {
      if (!isWorkingDay(dateStr, employee.id, leaveMap)) {
        continue;
      }

      let remainingHours = 8;
      const shuffledProjects = shuffleArray(PROJECTS);

      for (let i = 0; i < shuffledProjects.length; i++) {
        const project = shuffledProjects[i];
        let hours: number;

        if (i === shuffledProjects.length - 1) {
          // Last project gets remaining hours
          hours = remainingHours;
        } else {
          // Ensure each remaining project gets at least 1 hour
          const projectsRemaining = shuffledProjects.length - i;
          const maxHours = Math.min(6, remainingHours - (projectsRemaining - 1));
          const minHours = 1;

          if (maxHours <= minHours) {
            hours = minHours;
          } else {
            hours = roundToHalf(minHours + Math.random() * (maxHours - minHours));
          }
        }

        remainingHours -= hours;

        const entry: TimesheetEntry = {
          id: `${employee.id}-${dateStr}-${project.code}`,
          employeeId: employee.id,
          employeeName: employee.name,
          date: dateStr,
          projectCode: project.code,
          projectName: project.name,
          taskDescription: getRandomTask(employee.taskCategories),
          hours: hours,
        };

        entries.push(entry);
      }
    }
  }

  // Sort by date, then employee, then project
  entries.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.employeeName !== b.employeeName)
      return a.employeeName.localeCompare(b.employeeName);
    return a.projectName.localeCompare(b.projectName);
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
