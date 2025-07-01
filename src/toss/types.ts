// ============================================================================
// CORE GAME TYPES
// ============================================================================

/**
 * Represents the core Toss game event data from the blockchain
 * Used for both transaction execution and UI visualization
 */
export interface TossEventData {
	charge: string
	credit: string
	edge_bps: number
	expect: boolean
	face_bps: number
	peer_id: string
	player: string
	profit: string
	result: boolean
}

/**
 * Represents the marketplace Origin event data from the blockchain
 * Contains fee and commission information for complex transactions
 */
export interface OriginEventData {
	gross_reward: string
	inviter: {
		vec: string[]
	}
	marketplace_fee: string
	marketplace_id: string
	peer_id: string
	referral_commission: string
	skin_commission: string
	skin_id: string
	winner: string
}

// ============================================================================
// TRANSACTION EXECUTION TYPES
// ============================================================================

/**
 * Parameters required to build a toss transaction
 */
export interface TossTransactionParams {
	peerId: string
	assetToUse: bigint
	creditsToUse: bigint
	outcome: boolean
	senderAddress: string
}

/**
 * Result of executing a toss transaction
 */
export interface TossExecutionResult {
	success: boolean
	error?: string
	gameResult?: TossEventData // Use the unified type
	transactionHash?: string // Transaction hash for navigation
}

// ============================================================================
// UI VISUALIZATION TYPES
// ============================================================================

/**
 * Represents a single outflow in the transaction flow diagram
 */
export interface OutflowData {
	source: string
	type: string
	amount: string
	destination: string
	flow_type: "real_asset" | "credit"
}

/**
 * Complete outflow data with calculated rates
 */
export interface ExtractedOutflows {
	outflows: OutflowData[]
	rates: Record<string, string>
}

/**
 * Data structure for Sankey chart visualization
 */
export interface SankeyData {
	nodes: Array<{ name: string; rate?: string }>
	links: Array<{ source: number; target: number; value: number }>
}

/**
 * Sankey data with additional rate information
 */
export interface SankeyDataWithRates extends SankeyData {
	rates: Record<string, string>
}
