import { Holiday } from '@/types';

export const PUBLIC_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-14', name: 'Sankranti' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-04', name: 'Holi' },
  { date: '2026-05-01', name: 'Labour Day' },
  { date: '2026-08-17', name: 'Independence Day' },
  { date: '2026-08-28', name: 'Rakshabandhan' },
  { date: '2026-09-14', name: 'Ganesha Chaturthi' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-20', name: 'Dussehra/Vijayadasami' },
  { date: '2026-11-09', name: 'Diwali' },
  { date: '2026-11-11', name: 'Bhai Duj' },
  { date: '2026-12-25', name: 'Christmas' },
];

export function isHoliday(dateStr: string): boolean {
  return PUBLIC_HOLIDAYS_2026.some((h) => h.date === dateStr);
}

export function getHolidayName(dateStr: string): string | undefined {
  const holiday = PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr);
  return holiday?.name;
}
