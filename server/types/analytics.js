/**
 * Analytics Types
 *
 * This module defines TypeScript-like types for analytics data.
 */

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string} id - Unique identifier
 * @property {string} userId - User ID associated with the event
 * @property {string} eventType - Type of event
 * @property {Object} eventData - Additional event data
 * @property {string} sessionId - Session ID associated with the event
 * @property {string} ipAddress - IP address
 * @property {string} userAgent - User agent string
 * @property {string} timestamp - Event timestamp
 */

/**
 * @typedef {Object} AnalyticsEventsResponse
 * @property {AnalyticsEvent[]} events - List of events
 * @property {number} totalCount - Total count of events
 * @property {number} page - Current page
 * @property {number} pageSize - Page size
 */

/**
 * @typedef {Object} AnalyticsDashboardResponse
 * @property {Object} summary - Summary statistics
 * @property {number} summary.totalUsers - Total users
 * @property {number} summary.totalGuestUsers - Total guest users
 * @property {number} summary.totalChatSessions - Total chat sessions
 * @property {number} summary.totalChatMessages - Total chat messages
 * @property {Object[]} eventsByType - Events grouped by type
 * @property {Object[]} eventsByDay - Events grouped by day
 * @property {Object[]} activeUsersByDay - Active users grouped by day
 */

/**
 * @typedef {Object} UserActivityAnalyticsResponse
 * @property {Object} user - User details
 * @property {Object[]} sessions - User's sessions
 * @property {AnalyticsEvent[]} recentEvents - Recent events
 * @property {Object[]} eventsByType - Events grouped by type
 * @property {Object[]} activityByDay - Activity grouped by day
 */

/**
 * @typedef {Object} ChatAnalyticsResponse
 * @property {Object} summary - Summary statistics
 * @property {number} summary.totalSessions - Total sessions
 * @property {number} summary.totalMessages - Total messages
 * @property {number} summary.avgMessagesPerSession - Average messages per session
 * @property {Object[]} sessionsByDay - Sessions grouped by day
 * @property {Object[]} messagesByDay - Messages grouped by day
 * @property {Object[]} topUsers - Top users by message count
 */

module.exports = {};
