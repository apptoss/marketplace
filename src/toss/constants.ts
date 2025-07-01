// ============================================================================
// TRANSACTION CONSTANTS
// ============================================================================

/**
 * Default timeout for transaction confirmation (in milliseconds)
 */
export const TRANSACTION_TIMEOUT = 30000

/**
 * Delay before invalidating balances after transaction (in milliseconds)
 */
export const BALANCE_INVALIDATION_DELAY = 1000

// ============================================================================
// GAME CONSTANTS
// ============================================================================

/**
 * Maximum number of decimal places for percentage display
 */
export const MAX_PERCENTAGE_DECIMALS = 2

/**
 * Basis points divisor (10000 = 100%)
 */
export const BASIS_POINTS_DIVISOR = 10000n

/**
 * Percentage multiplier for calculations
 */
export const PERCENTAGE_MULTIPLIER = 100

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Human readable labels for Sankey chart nodes
 */
export const NODE_LABELS: Record<string, string> = {
	charge_stake: "Charge Stake",
	credit_stake: "Credit Stake",
	credit_reward: "Credit Reward",
	peer: "Peer",
	player: "Player",
	marketplace: "Marketplace",
	inviter: "Referrer",
	skin_builder: "Skin Creator",
} as const

/**
 * Chart colors for Sankey nodes
 */
export const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const
