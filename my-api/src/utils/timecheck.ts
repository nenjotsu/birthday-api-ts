import { DateTime } from 'luxon';
import { Item } from "../types";

 /**
   * Get possible MM-DD values that could be "today" across different timezones
   * Since timezones can be ±12 hours, we need to check yesterday, today, and tomorrow
   */
export function getPossibleBirthdayKeys(): string[] {
  const now = new Date();
  const keys = new Set<string>();

  // Check -12 to +14 hours (to cover all timezones)
  for (let offset = -12; offset <= 14; offset++) {
    const date = new Date(now.getTime() + offset * 60 * 60 * 1000);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    keys.add(`${month}-${day}`);
  }

  return Array.from(keys);
}

/**
 * Check if today is the user's birthday in their timezone
 */
export const isBirthdayToday = (user: Item): boolean => {
  try {
    // Get current date/time in user's timezone
    const userNow = DateTime.now().setZone(user.timezone);

    // Parse birthday (format: YYYY-MM-DD)
    const [, month, day] = user.birthday.split('-');
    const birthdayMonth = parseInt(month, 10);
    const birthdayDay = parseInt(day, 10);

    // Compare month and day
    return userNow.month === birthdayMonth && userNow.day === birthdayDay;
  } catch (error) {
    console.error(`Error checking birthday for user ${user.id}:`, error);
    return false;
  }
};

export const is9AMInUserTimezone = (user: Item): boolean => {
  try {
    const userNow = DateTime.now().setZone(user.timezone);
    return userNow.hour === 16; // && userNow.minute === 0;
  } catch (error) {
    console.error(`Error checking 9AM for user ${user.id}:`, error);
    return false;
  }
}

