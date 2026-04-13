/**
 * Test suite for mapping handlers
 */

import {
  parseSorobanContractEvent,
  validateEvent,
  filterEventsByContract,
  groupEventsByType,
  createAuditLogFromEvent,
} from '../src/mappings/handlers';
import { ContractEvent, RawContractEvent, EventType } from '../src/types';

describe('parseSorobanContractEvent', () => {
  const mockRawEvent: RawContractEvent = {
    id: 'test-event-1',
    type: 'transfer',
    ledger: 12345,
    opIndex: 0,
    txIndex: 0,
    txHash: 'abc123',
    contractId: 'CA3D5KMEV65EGT2KJP4S3C2JU2XH7X6K2Z2K2Z2K2Z2K2Z2K2Z2K2',
    topics: ['transfer', 'from_address', 'to_address'],
    data: '{"amount": "100"}',
    timestamp: 1700000000000,
  };

  it('should parse a raw Soroban contract event', () => {
    const result = parseSorobanContractEvent(mockRawEvent);
    
    expect(result.id).toBe('test-event-1');
    expect(result.contractId).toBe(mockRawEvent.contractId);
    expect(result.txHash).toBe(mockRawEvent.txHash);
    expect(result.ledger).toBe(mockRawEvent.ledger);
  });

  it('should parse event type correctly', () => {
    const result = parseSorobanContractEvent(mockRawEvent);
    
    expect(result.eventType).toBe('transfer');
  });

  it('should parse payload correctly', () => {
    const result = parseSorobanContractEvent(mockRawEvent);
    
    expect(result.payload).toBeDefined();
    expect(result.topic).toBe('transfer');
  });
});

describe('validateEvent', () => {
  const validEvent: ContractEvent = {
    id: 'test-1',
    contractId: 'CA3D5KMEV65EGT2KJP4S3C2JU2XH7X6K2Z2K2Z2K2Z2K2Z2K2Z2K2',
    eventType: 'transfer' as EventType,
    txHash: 'abc123',
    ledger: 100,
    eventIndex: 0,
    topic: 'transfer',
    payload: {},
    emittedAt: new Date(),
    createdAt: new Date(),
  };

  it('should return true for valid event', () => {
    const result = validateEvent(validEvent);
    
    expect(result).toBe(true);
  });

  it('should return false for event without contract ID', () => {
    const event = { ...validEvent, contractId: '' };
    const result = validateEvent(event as ContractEvent);
    
    expect(result).toBe(false);
  });

  it('should return false for event without tx hash', () => {
    const event = { ...validEvent, txHash: '' };
    const result = validateEvent(event as ContractEvent);
    
    expect(result).toBe(false);
  });

  it('should return false for event with negative ledger', () => {
    const event = { ...validEvent, ledger: -1 };
    const result = validateEvent(event as ContractEvent);
    
    expect(result).toBe(false);
  });
});

describe('filterEventsByContract', () => {
  const events: ContractEvent[] = [
    {
      id: '1',
      contractId: 'CA111',
      eventType: 'transfer' as EventType,
      txHash: 'tx1',
      ledger: 100,
      eventIndex: 0,
      topic: '',
      payload: {},
      emittedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      contractId: 'CA222',
      eventType: 'swap' as EventType,
      txHash: 'tx2',
      ledger: 101,
      eventIndex: 1,
      topic: '',
      payload: {},
      emittedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  it('should filter events by contract ID', () => {
    const result = filterEventsByContract(events, ['CA111']);
    
    expect(result.length).toBe(1);
    expect(result[0].contractId).toBe('CA111');
  });

  it('should return empty array for no matches', () => {
    const result = filterEventsByContract(events, ['CA999']);
    
    expect(result.length).toBe(0);
  });
});

describe('groupEventsByType', () => {
  const events: ContractEvent[] = [
    {
      id: '1',
      contractId: 'CA111',
      eventType: 'transfer' as EventType,
      txHash: 'tx1',
      ledger: 100,
      eventIndex: 0,
      topic: '',
      payload: {},
      emittedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      contractId: 'CA222',
      eventType: 'swap' as EventType,
      txHash: 'tx2',
      ledger: 101,
      eventIndex: 1,
      topic: '',
      payload: {},
      emittedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '3',
      contractId: 'CA111',
      eventType: 'transfer' as EventType,
      txHash: 'tx3',
      ledger: 102,
      eventIndex: 2,
      topic: '',
      payload: {},
      emittedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  it('should group events by type', () => {
    const result = groupEventsByType(events);
    
    expect(result.get('transfer')?.length).toBe(2);
    expect(result.get('swap')?.length).toBe(1);
  });
});

describe('createAuditLogFromEvent', () => {
  const transferEvent: ContractEvent = {
    id: 'test-1',
    contractId: 'CA3D5KMEV65EGT2KJP4S3C2JU2XH7X6K2Z2K2Z2K2Z2K2Z2K2Z2K2',
    eventType: 'transfer' as EventType,
    txHash: 'tx123',
    ledger: 100,
    eventIndex: 0,
    topic: 'transfer',
    payload: {
      from: 'GB111',
      to: 'GB222',
      amount: '100',
    },
    emittedAt: new Date(),
    createdAt: new Date(),
  };

  it('should create audit log from transfer event', () => {
    const result = createAuditLogFromEvent(transferEvent);
    
    expect(result.eventType).toBe('transfer');
    expect(result.contractId).toBe(transferEvent.contractId);
    expect(result.transactionHash).toBe(transferEvent.txHash);
    expect(result.fromAddress).toBe('GB111');
    expect(result.toAddress).toBe('GB222');
    expect(result.amount).toBe('100');
  });
});