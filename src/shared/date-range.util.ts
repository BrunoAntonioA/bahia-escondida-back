const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateInput(value: string): Date {
  const datePart = value.slice(0, 10);

  if (!DATE_ONLY_PATTERN.test(datePart)) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }

    return parsed;
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function endOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

export function parseDateRange(startDate: string, endDate: string): {
  start: Date;
  end: Date;
} {
  const start = startOfDay(parseDateInput(startDate));
  const end = endOfDay(parseDateInput(endDate));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date range');
  }

  return { start, end };
}
