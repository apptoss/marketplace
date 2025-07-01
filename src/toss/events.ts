import type { UserTransactionResponse } from "@aptos-labs/ts-sdk"
import type { OriginEventData, TossEventData } from "./types"

/**
 * Event type suffixes for toss-related events
 * These are used with endsWith() to match events regardless of package ID
 */
export const EVENT_TYPES = {
	/** Toss game event */
	TOSS: "::toss::Toss",
	/** Marketplace origin event with fee information */
	ORIGIN: "::marketplace::Origin",
} as const

/**
 * Finds a Toss event in a transaction
 * @param transaction The transaction to search
 * @returns The Toss event data or undefined if not found
 */
export function findTossEvent(
	transaction: UserTransactionResponse,
): TossEventData | undefined {
	const tossEvent = transaction.events?.find((event) =>
		event.type.endsWith(EVENT_TYPES.TOSS),
	)
	return tossEvent?.data as TossEventData | undefined
}

/**
 * Finds an Origin event in a transaction
 * @param transaction The transaction to search
 * @returns The Origin event data or undefined if not found
 */
export function findOriginEvent(
	transaction: UserTransactionResponse,
): OriginEventData | undefined {
	const originEvent = transaction.events?.find((event) =>
		event.type.endsWith(EVENT_TYPES.ORIGIN),
	)
	return originEvent?.data as OriginEventData | undefined
}

/**
 * Finds both Toss and Origin events in a transaction
 * @param transaction The transaction to search
 * @returns Object containing both events (may be undefined)
 */
export function findTossEvents(transaction: UserTransactionResponse): {
	tossEvent: TossEventData | undefined
	originEvent: OriginEventData | undefined
} {
	return {
		tossEvent: findTossEvent(transaction),
		originEvent: findOriginEvent(transaction),
	}
}

/**
 * Validates if a transaction contains a Toss event
 * @param transaction The transaction to validate
 * @returns True if the transaction contains a Toss event
 */
export function hasTossEvent(transaction: UserTransactionResponse): boolean {
	return (
		transaction.events?.some((event) =>
			event.type.endsWith(EVENT_TYPES.TOSS),
		) ?? false
	)
}

/**
 * Validates if a transaction contains an Origin event
 * @param transaction The transaction to validate
 * @returns True if the transaction contains an Origin event
 */
export function hasOriginEvent(transaction: UserTransactionResponse): boolean {
	return (
		transaction.events?.some((event) =>
			event.type.endsWith(EVENT_TYPES.ORIGIN),
		) ?? false
	)
}

/**
 * Gets all events of a specific type from a transaction
 * @param transaction The transaction to search
 * @param eventType The event type suffix to match
 * @returns Array of matching events
 */
export function getEventsByType(
	transaction: UserTransactionResponse,
	eventType: string,
) {
	return (
		transaction.events?.filter((event) => event.type.endsWith(eventType)) ?? []
	)
}

/**
 * Validates event type using regex pattern
 * @param eventType The event type to validate
 * @param pattern The pattern to match against
 * @returns True if the event type matches the pattern
 */
export function validateEventType(eventType: string, pattern: RegExp): boolean {
	return pattern.test(eventType)
}
