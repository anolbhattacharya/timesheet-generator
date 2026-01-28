export interface Employee {
  id: string;
  name: string;
  role: string;
  skills: string[];
  taskCategories: string[];
}

export interface Project {
  code: string;
  name: string;
  description: string;
}

export interface LeaveRecord {
  employeeId: string;
  date: string; // ISO date string YYYY-MM-DD
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // ISO date string YYYY-MM-DD
  projectCode: string;
  projectName: string;
  taskDescription: string;
  hours: number;
}

export interface Holiday {
  date: string; // ISO date string YYYY-MM-DD
  name: string;
}

export interface DayStatus {
  date: string; // ISO date string YYYY-MM-DD
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isLeave: boolean;
}

export interface EmployeeLeaveMap {
  [employeeId: string]: string[]; // array of ISO date strings
}
