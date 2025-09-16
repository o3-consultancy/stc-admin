import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with timezone plugins
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Convert UTC timestamp from API to UTC+3 (display timezone)
 * @param {string|Date} timestamp - The UTC timestamp from API
 * @param {string} format - The format to return (default: "YYYY-MM-DD HH:mm")
 * @returns {string} - Formatted timestamp in UTC+3
 */
export function formatToDisplayTimezone(timestamp, format = "YYYY-MM-DD HH:mm") {
    if (!timestamp) return ""

    // API returns timestamps in UTC, convert to UTC+3 (Asia/Kuwait) for display
    return dayjs.utc(timestamp)
        .tz('Asia/Kuwait') // UTC+3 (display timezone)
        .format(format)
}

/**
 * Get current date in UTC+3 for date picker defaults
 * @param {string} format - The format to return (default: "YYYY-MM-DD")
 * @returns {string} - Current date in UTC+3
 */
export function getCurrentDateInDisplayTimezone(format = "YYYY-MM-DD") {
    return dayjs().tz('Asia/Kuwait').format(format)
}

/**
 * Convert date from display timezone (UTC+3) to date string for API calls
 * The API expects YYYY-MM-DD format and treats it as UTC date boundaries
 * When user selects "2024-01-15" in UTC+3, we send "2024-01-15" as-is
 * This gives the user data for the full day of Jan 15th in their timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format from display timezone
 * @returns {string} - Date string in YYYY-MM-DD format for API
 */
export function convertDateForAPI(dateString) {
    if (!dateString) return ""

    // Send the date as-is in the user's timezone
    // This ensures that when user selects "2024-01-15", they get data for
    // the full day of January 15th in their timezone (UTC+3)
    return dateString
}
