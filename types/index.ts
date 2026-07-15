// Cost classification for IP-capitalisation accounting (AASB 138):
// CAPEX  = development-phase work eligible for capitalisation as an intangible asset (para 57)
// OPEX   = maintenance / research-phase work expensed as incurred (para 54-56, 68)
export type CostType = 'CAPEX' | 'OPEX';

export interface TaskCategory {
  description: string;
  costType: CostType;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  location: string;
  skills: string[];
  tasks: TaskCategory[];
}

export interface Project {
  code: string;
  name: string;
  description: string;
  // Share of each person's time allocated to this product (0-1). Weights sum to 1.
  allocationWeight: number;
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
  costType: CostType;
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
