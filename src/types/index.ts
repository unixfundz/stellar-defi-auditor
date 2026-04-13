/**
 * Core type definitions for Stellar DeFi Auditor
 * 
 * These types represent the fundamental data structures used
 * throughout the indexing system for tracking Stellar/Soroban
 * financial movements.
 */

// ============================================
// Event Types
// ============================================

/**
 * Represents a parsed contract event from the Stellar network
 */
export interface ContractEvent {
  id: string;
  contractId: string;
  eventType: EventType;
  txHash: string;
  ledger: number;
  eventIndex: number;
  topic: string;
  payload: Record<string, unknown>;
  emittedAt: Date;
  createdAt: Date;
}

/**
 * Types of events tracked by the audit system
 */
export type EventType = 
  | 'transfer'
  | 'swap'
  | 'liquidity_deposit'
  | 'liquidity_withdrawal'
  | 'invocation'
  | 'account_credit'
  | 'account_debit'
  | 'custom';

/**
 * Raw event data received from RPC provider
 */
export interface RawContractEvent {
  id: string;
  type: string;
  ledger: number;
  opIndex: number;
  txIndex: number;
  txHash: string;
  contractId: string;
  topics: string[];
  data: string;
  timestamp: number;
}

// ============================================
// Financial Transaction Types
// ============================================

/**
 * Represents a financial transaction on the Stellar network
 */
export interface FinancialTransaction {
  id: string;
  txHash: string;
  sourceAccount: string;
  feeBumpTxHash?: string;
  isTransactionEnvelopeB64: boolean;
  transactionEnvelope: string;
  ledger: number;
  ledgerCloseTime: Date;
  successful: boolean;
  applicationOrder: number;
  feeCharged: number;
  maxFee: number;
  operationCount: number;
  signatureBase64: string;
  signatures: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents an individual operation within a transaction
 */
export interface TransactionOperation {
  id: string;
  transactionId: string;
  operationIndex: number;
  operationType: OperationType;
  operationDetails: Record<string, unknown>;
  sourceAccount?: string;
  createdAt: Date;
}

/**
 * Types of operations in Stellar transactions
 */
export type OperationType =
  | 'create_account'
  | 'payment'
  | 'path_payment_strict_receive'
  | 'path_payment_strict_send'
  | 'manage_sell_offer'
  | 'manage_buy_offer'
  | 'create_passive_sell_offer'
  | 'set_trust_line_flags'
  | 'manage_data'
  | 'bump_sequence'
  | 'invoke_contract_function'
  | 'extend_footprint_ttl'
  | 'restore_footprint';

// ============================================
// Audit Log Types
// ============================================

/**
 * Represents an audit log entry for financial tracking
 */
export interface AuditLog {
  id: string;
  eventType: EventType;
  contractId: string;
  transactionHash: string;
  ledger: number;
  previousBalance?: string;
  newBalance?: string;
  amount?: string;
  assetCode?: string;
  assetIssuer?: string;
  fromAddress?: string;
  toAddress?: string;
  liquidityPoolId?: string;
  poolTokenReceived?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Status of audit log processing
 */
export type AuditStatus = 'pending' | 'processed' | 'failed' | 'reconciled';

// ============================================
// Account and Balance Types
// ============================================

/**
 * Represents a tracked Stellar account
 */
export interface TrackedAccount {
  id: string;
  accountId: string;
  label?: string;
  isActive: boolean;
  startLedger: number;
  lastSyncedLedger: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Account balance at a specific point in time
 */
export interface AccountBalance {
  id: string;
  trackedAccountId: string;
  balance: string;
  assetCode: string;
  assetIssuer?: string;
  assetType: AssetType;
  snapshotLedger: number;
  recordedAt: Date;
}

/**
 * Types of assets on Stellar
 */
export type AssetType = 'native' | 'credit_alphanum4' | 'credit_alphanum12' | 'liquidity_pool_shares';

// ============================================
// Liquidity Pool Types
// ============================================

/**
 * Represents a liquidity pool
 */
export interface LiquidityPool {
  id: string;
  poolId: string;
  poolType: LiquidityPoolType;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalPoolShares: string;
  lastSyncedLedger: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Types of liquidity pools
 */
export type LiquidityPoolType = 'constant_product' | 'constant_product_2ps';

/**
 * Liquidity pool swap event
 */
export interface LiquidityPoolSwap {
  id: string;
  liquidityPoolId: string;
  txHash: string;
  ledger: bigint;
  eventIndex: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact?: string;
  createdAt: Date;
}

/**
 * Liquidity pool deposit event
 */
export interface LiquidityPoolDeposit {
  id: string;
  liquidityPoolId: string;
  txHash: string;
  ledger: bigint;
  eventIndex: number;
  depositor: string;
  reserveA: string;
  reserveB: string;
  poolSharesMinted: string;
  createdAt: Date;
}

/**
 * Liquidity pool withdrawal event
 */
export interface LiquidityPoolWithdrawal {
  id: string;
  liquidityPoolId: string;
  txHash: string;
  ledger: bigint;
  eventIndex: number;
  withdrawer: string;
  reserveA: string;
  reserveB: string;
  poolSharesBurned: string;
  createdAt: Date;
}

// ============================================
// Indexer Configuration Types
// ============================================

/**
 * Network configuration
 */
export interface NetworkConfig {
  name: string;
  network: 'mainnet' | 'testnet' | 'futurenet';
  horizonUrl: string;
  rpcUrl: string;
  passphrase: string;
  friendbotUrl?: string;
}

/**
 * Indexer configuration
 */
export interface IndexerConfig {
  network: NetworkConfig;
  pollingIntervalMs: number;
  batchSize: number;
  rpcMaxRetries: number;
  rpcRetryDelayMs: number;
  startLedger?: number;
  contracts: string[];
}

// ============================================
// API Response Types
// ============================================

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  network: string;
  lastProcessedLedger: number;
  lastEventTimestamp?: Date;
  databaseConnected: boolean;
  rpcConnected: boolean;
}

// ============================================
// Webhook Types
// ============================================

/**
 * Webhook subscription
 */
export interface WebhookSubscription {
  id: string;
  targetUrl: string;
  secret: string;
  isActive: boolean;
  eventType?: EventType;
  trackedContractId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
  id: string;
  eventType: EventType;
  contractId: string;
  txHash: string;
  ledger: number;
  eventIndex: number;
  topic: string;
  payload: Record<string, unknown>;
  emittedAt: string;
  signature: string;
}