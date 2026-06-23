export function computeOccurrenceDates(startDate: string, daysOfWeek: number[], occurrenceCount: number): Date[] {
  const days = new Set(daysOfWeek)
  const dates: Date[] = []
  const cursor = new Date(`${startDate}T00:00:00`)

  while (dates.length < occurrenceCount) {
    if (days.has(cursor.getDay())) {
      dates.push(new Date(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const combined = new Date(date)
  combined.setHours(hours, minutes, 0, 0)
  return combined
}
