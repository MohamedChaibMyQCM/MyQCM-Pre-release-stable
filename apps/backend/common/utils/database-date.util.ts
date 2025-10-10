export class DatabaseDateUtils {
  static getTodayDate(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  static getYesterdayDate(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  static isConsecutiveDay(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Normalize both dates to midnight
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    // Check if d2 is the next day after d1
    const oneDayMillis = 24 * 60 * 60 * 1000;
    const diffMillis = d2.getTime() - d1.getTime();

    return diffMillis >= oneDayMillis && diffMillis < 2 * oneDayMillis;
  }

  static getDaysBetween(date1: Date, date2: Date): number {
    if (!date1 || !date2) return Infinity;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Normalize both dates to midnight
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    // Calculate difference in days
    return Math.round(
      Math.abs(d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000),
    );
  }
}
