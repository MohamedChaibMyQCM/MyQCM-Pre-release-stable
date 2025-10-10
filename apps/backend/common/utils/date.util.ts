import { BadRequestException } from "@nestjs/common";
import { Between } from "typeorm";

export class DateUtils {
  private static TIMEZONE = "Africa/Algiers";

  /**
   * Get the exact current date and time in timezone
   */
  static getCurrentDate(): Date {
    const now = new Date();

    // Format date to timezone time
    const timezon_time_string = new Intl.DateTimeFormat("en-US", {
      timeZone: this.TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    // Extract values from formatted string
    const [month, day, year, hour, minute, second] = timezon_time_string
      .match(/\d+/g)
      .map(Number);

    // Construct a Date object correctly
    return new Date(year, month - 1, day, hour, minute, second);
  }

  /**
   * Get today's date in YYYY-MM-DD format in Algeria timezone
   */
  static getTodayDate(): string {
    const now = new Date();
    const algeriaDate = new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: this.TIMEZONE,
      }).format(now),
    );
    return algeriaDate.toISOString().split("T")[0];
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format in Algeria timezone
   */
  static getYesterdayDate(): string {
    const now = new Date();
    const algeriaDate = new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: this.TIMEZONE,
      }).format(now),
    );

    algeriaDate.setDate(algeriaDate.getDate() - 1);

    return algeriaDate.toISOString().split("T")[0];
  }

  /**
   * Calculate days between two YYYY-MM-DD dates, considering Algeria timezone
   */
  static getDaysBetween(dateStart: string, dateEnd: string): number {
    const start = new Date(`${dateStart}T00:00:00${this.getTimezoneOffset()}`);
    const end = new Date(`${dateEnd}T00:00:00${this.getTimezoneOffset()}`);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the range of the current week (Sunday to Saturday) in Algeria timezone
   */
  static getCurrentWeekRange() {
    const now = new Date();
    const day_of_week = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Get start of the week (Sunday)
    const start_of_week = new Date(now);
    start_of_week.setDate(now.getDate() - day_of_week);
    start_of_week.setHours(0, 0, 0, 0);

    // Get end of the week (Saturday)
    const end_of_week = new Date(start_of_week);
    end_of_week.setDate(start_of_week.getDate() + 6);
    end_of_week.setHours(23, 59, 59, 999);

    return { start_of_week, end_of_week };
  }
  /**
   * Get Algeria's timezone offset in ISO 8601 format (e.g., "+01:00")
   */
  private static getTimezoneOffset(): string {
    const now = new Date();
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: this.TIMEZONE,
      timeZoneName: "short",
    })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value;

    if (!offset) return "+01:00"; // Default fallback

    const match = offset.match(/([+-]\d{2})(\d{2})?/);
    if (match) {
      return `${match[1]}:${match[2] || "00"}`;
    }

    return "+01:00"; // Default fallback
  }

  /**
   * Creates a date range condition for database queries.
   *
   * @param date - Either a Date object or an object with optional start and end Date properties
   * @returns A Between condition for TypeORM queries, or undefined if no valid date information is provided
   */
  static createDateRange = (date: Date | { start?: Date; end?: Date }) => {
    if (date instanceof Date) {
      const start_of_day = new Date(date);
      start_of_day.setHours(0, 0, 0, 0);

      const end_of_day = new Date(date);
      end_of_day.setHours(23, 59, 59, 999);

      return Between(start_of_day, end_of_day);
    } else if (typeof date === "object") {
      const { start, end } = date;
      if (start && end) return Between(start, end);
      if (start) return Between(start, new Date());
    }
    return undefined;
  };

  /**
   * Returns the start and end of day for a given date in Algeria timezone
   */
  static getDayBoundaries(date: Date = this.getCurrentDate()): {
    startOfDay: Date;
    endOfDay: Date;
  } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
  }
  /**
   * Validates that a date is properly formatted and optionally in the future
   * @param dateString - The date string to validate
   * @param requireFuture - Whether the date must be in the future
   * @returns The validated Date object
   * @throws BadRequestException if the date is invalid or not in the future when required
   */
  static validateDate(dateString: string | Date, requireFuture = false): Date {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date format");
    }

    if (requireFuture && date <= new Date()) {
      throw new BadRequestException("Date must be in the future");
    }

    return date;
  }
}
