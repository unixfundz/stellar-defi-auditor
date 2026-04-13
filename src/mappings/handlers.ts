/**
 * Event Mappings - Data Transformation Logic
 * 
 * This module handles parsing and transforming Soroban contract events
 * into structured data suitable for the audit system.
 * 
 * @author Stellar Financial Audit Team
 * @version 1.0.0
 */

import { 
  ContractEvent, 
  RawContractEvent, 
  EventType,
  AuditLog,
  LiquidityPoolSwap,
  LiquidityPoolDeposit,
  LiquidityPoolWithdrawal
} from '../types';

/**
 * Parses a raw Soroban contract event into a structured ContractEvent
 * 
 * @param rawEvent - The raw event data from the RPC provider
 * @returns Parsed ContractEvent object
 */
export function parseSorobanContractEvent(rawEvent: RawContractEvent): ContractEvent {
  const { topics, data, type, ledger, txHash, contractId, id, timestamp, opIndex, txIndex } = rawEvent;
  
  // Parse the event type from the first topic if available
  const eventType = parseEventType(topics[0] || type);
  
  // Parse the payload from the event data
  const payload = parseEventPayload(topics, data);
  
  return {
    id,
    contractId,
    eventType,
    txHash,
    ledger,
    eventIndex: opIndex,
    topic: topics[0] || '',
    payload,
    emittedAt: new Date(timestamp),
    createdAt: new Date(),
  };
}

/**
 * Determines the event type from event topics or type string
 * 
 * @param topicOrType - The topic string or type from the event
 * @returns The corresponding EventType
 */
function parseEventType(topicOrType: string): EventType {
  const normalized = topicOrType.toLowerCase();
  
  if (normalized.includes('transfer')) return 'transfer';
  if (normalized.includes('swap')) return 'swap';
  if (normalized.includes('deposit')) return 'liquidity_deposit';
  if (normalized.includes('withdraw')) return 'liquidity_withdrawal';
  if (normalized.includes('invocation') || normalized.includes('call')) return 'invocation';
  if (normalized.includes('credit')) return 'account_credit';
  if (normalized.includes('debit')) return 'account_debit';
  
  return 'custom';
}

/**
 * Parses the event payload from topics and data
 * 
 * @param topics - Event topics
 * @param data - Event data string
 * @returns Parsed payload object
 */
function parseEventPayload(topics: string[], data: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  // Topics provide context about the event
  if (topics.length > 1) {
    payload.topic0 = topics[0];
    payload.topic1 = topics[1];
    payload.topic2 = topics[2];
    payload.topic3 = topics[3];
  }
  
  // Data contains the actual event values
  try {
    // Attempt to parse as JSON
    const parsed = JSON.parse(data);
    payload.data = parsed;
  } catch {
    // If not JSON, store as-is
    payload.rawData = data;
  }
  
  return payload;
}

/**
 * Creates an AuditLog entry from a ContractEvent
 * 
 * @param event - The contract event to transform
 * @returns AuditLog entry
 */
export function createAuditLogFromEvent(event: ContractEvent): Omit<AuditLog, 'id' | 'createdAt'> {
  const baseLog = {
    eventType: event.eventType,
    contractId: event.contractId,
    transactionHash: event.txHash,
    ledger: event.ledger,
    metadata: {
      eventIndex: event.eventIndex,
      topic: event.topic,
      payload: event.payload,
    },
    status: 'pending' as const,
  };
  
  // Extract financial details based on event type
  switch (event.eventType) {
    case 'transfer':
      return {
        ...baseLog,
        fromAddress: extractAddress(event.payload, 'from'),
        toAddress: extractAddress(event.payload, 'to'),
        amount: extractAmount(event.payload, 'amount'),
        assetCode: extractAssetCode(event.payload),
        assetIssuer: extractAssetIssuer(event.payload),
      };
      
    case 'swap':
      return {
        ...baseLog,
        fromAddress: extractAddress(event.payload, 'from'),
        toAddress: extractAddress(event.payload, 'to'),
        amount: extractAmount(event.payload, 'soldAmount'),
        assetCode: extractAssetCode(event.payload, 'soldAsset'),
      };
      
    case 'liquidity_deposit':
      return {
        ...baseLog,
        fromAddress: extractAddress(event.payload, 'depositor'),
        amount: extractAmount(event.payload, 'reserveA'),
        assetCode: extractAssetCode(event.payload, 'tokenA'),
      };
      
    case 'liquidity_withdrawal':
      return {
        ...baseLog,
        fromAddress: extractAddress(event.payload, 'withdrawer'),
        amount: extractAmount(event.payload, 'reserveA'),
        assetCode: extractAssetCode(event.payload, 'tokenA'),
      };
      
    default:
      return baseLog;
  }
}

/**
 * Extracts an address from payload
 */
function extractAddress(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return (value as Record<string, unknown>).address as string;
  }
  return undefined;
}

/**
 * Extracts an amount from payload
 */
function extractAmount(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return (value as Record<string, unknown>).value as string || 
           String(value);
  }
  return undefined;
}

/**
 * Extracts an asset code from payload
 */
function extractAssetCode(payload: Record<string, unknown>, key: string = 'asset'): string | undefined {
  const value = payload[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return (value as Record<string, unknown>).code as string;
  }
  return undefined;
}

/**
 * Extracts an asset issuer from payload
 */
function extractAssetIssuer(payload: Record<string, unknown>): string | undefined {
  const asset = payload.asset;
  if (typeof asset === 'object' && asset !== null) {
    return (asset as Record<string, unknown>).issuer as string;
  }
  return undefined;
}

/**
 * Creates a LiquidityPoolSwap record from event data
 */
export function createSwapFromEvent(
  poolId: string,
  event: ContractEvent
): Omit<LiquidityPoolSwap, 'id' | 'createdAt'> {
  return {
    liquidityPoolId: poolId,
    txHash: event.txHash,
    ledger: BigInt(event.ledger),
    eventIndex: event.eventIndex,
    fromToken: extractAssetCode(event.payload, 'soldAsset') || 'UNKNOWN',
    toToken: extractAssetCode(event.payload, 'boughtAsset') || 'UNKNOWN',
    fromAmount: extractAmount(event.payload, 'soldAmount') || '0',
    toAmount: extractAmount(event.payload, 'boughtAmount') || '0',
    priceImpact: extractAmount(event.payload, 'priceImpact'),
  };
}

/**
 * Creates a LiquidityPoolDeposit record from event data
 */
export function createDepositFromEvent(
  poolId: string,
  event: ContractEvent
): Omit<LiquidityPoolDeposit, 'id' | 'createdAt'> {
  return {
    liquidityPoolId: poolId,
    txHash: event.txHash,
    ledger: BigInt(event.ledger),
    eventIndex: event.eventIndex,
    depositor: extractAddress(event.payload, 'depositor') || 'UNKNOWN',
    reserveA: extractAmount(event.payload, 'reserveA') || '0',
    reserveB: extractAmount(event.payload, 'reserveB') || '0',
    poolSharesMinted: extractAmount(event.payload, 'shares') || '0',
  };
}

/**
 * Creates a LiquidityPoolWithdrawal record from event data
 */
export function createWithdrawalFromEvent(
  poolId: string,
  event: ContractEvent
): Omit<LiquidityPoolWithdrawal, 'id' | 'createdAt'> {
  return {
    liquidityPoolId: poolId,
    txHash: event.txHash,
    ledger: BigInt(event.ledger),
    eventIndex: event.eventIndex,
    withdrawer: extractAddress(event.payload, 'withdrawer') || 'UNKNOWN',
    reserveA: extractAmount(event.payload, 'reserveA') || '0',
    reserveB: extractAmount(event.payload, 'reserveB') || '0',
    poolSharesBurned: extractAmount(event.payload, 'shares') || '0',
  };
}

/**
 * Validates an event before processing
 * 
 * @param event - The event to validate
 * @returns True if valid, false otherwise
 */
export function validateEvent(event: ContractEvent): boolean {
  // Must have a valid contract ID
  if (!event.contractId || event.contractId.length === 0) {
    return false;
  }
  
  // Must have a transaction hash
  if (!event.txHash || event.txHash.length === 0) {
    return false;
  }
  
  // Must have a valid ledger number
  if (!event.ledger || event.ledger < 0) {
    return false;
  }
  
  // Must have a valid event type
  const validTypes: EventType[] = [
    'transfer', 'swap', 'liquidity_deposit', 'liquidity_withdrawal',
    'invocation', 'account_credit', 'account_debit', 'custom'
  ];
  if (!validTypes.includes(event.eventType)) {
    return false;
  }
  
  return true;
}

/**
 * Filters events by contract ID
 * 
 * @param events - List of events to filter
 * @param contractIds - Contract IDs to include
 * @returns Filtered events
 */
export function filterEventsByContract(
  events: ContractEvent[],
  contractIds: string[]
): ContractEvent[] {
  return events.filter(event => 
    contractIds.includes(event.contractId)
  );
}

/**
 * Groups events by type
 * 
 * @param events - List of events to group
 * @returns Map of event type to events
 */
export function groupEventsByType(
  events: ContractEvent[]
): Map<EventType, ContractEvent[]> {
  const grouped = new Map<EventType, ContractEvent[]>();
  
  for (const event of events) {
    const existing = grouped.get(event.eventType) || [];
    existing.push(event);
    grouped.set(event.eventType, existing);
  }
  
  return grouped;
}