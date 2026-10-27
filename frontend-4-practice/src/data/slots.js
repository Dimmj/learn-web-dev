export function generateSlotsForDate(date) {
  const allTimes = [
    "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00",
  ];
  const seed = date.day * 31 + date.month * 12 + date.year;
  return allTimes.map((time, i) => ({
    time,
    isBusy: (seed + i * 7) % 5 === 0,
  }));
}