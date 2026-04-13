/**
 * Stellar RPC Client - Event Ingestion Logic
 * 
 * This module handles polling Stellar Core or Soroban RPC provider
 * to fetch contract events and transactions.
 * 
 * @author Stellar DeFi Auditor Team
 * @version 1.0.0
 */

import { 
  RawContractEvent, 
  NetworkConfig, 
  IndexerConfig 
} from '../types';

/**
 * Client for interacting with Stellar RPC endpoints
 */
export class StellarEventClient {
  private config: NetworkConfig;
  private rpcUrl: string;
  
  constructor(config: NetworkConfig) {
    this.config = config;
    this.rpcUrl = config.rpcUrl;
  }
  
  /**
   * Fetch contract events for a specific contract
   * 
   * @param contractId - The contract ID to fetch events for
   * @param cursor - Cursor for pagination
   * @param limit - Maximum number of events to fetch
   * @returns Array of raw contract events
   */
  async fetchEvents(
    contractId: string, 
    cursor: string = "now", 
    limit: number = 50
  ): Promise<RawContractEvent[]> {
    // Placeholder for Soroban RPC event streaming
    // This implementation uses the /getEvents API
    const response = await this.rpcRequest('getEvents', {
      contractIds: [contractId],
      startLedger: cursor,
      limit,
    });
    
    return this.parseEventsResponse(response);
  }
  
  /**
   * Fetch events for multiple contracts
   * 
   * @param contractIds - Array of contract IDs
   * @param cursor - Cursor for pagination
   * @param limit - Maximum number of events to fetch
   * @returns Array of raw contract events
   */
  async fetchEventsForContracts(
    contractIds: string[],
    cursor: string = "now",
    limit: number = 50
  ): Promise<RawContractEvent[]> {
    const response = await this.rpcRequest('getEvents', {
      contractIds,
      startLedger: cursor,
      limit,
    });
    
    return this.parseEventsResponse(response);
  }
  
  /**
   * Get the latest ledger number
   * 
   * @returns Latest ledger number
   */
  async getLatestLedger(): Promise<number> {
    const response = await this.rpcRequest('getLatestLedger');
    return response.sequence || 0;
  }
  
  /**
   * Get ledger details
   * 
   * @param sequence - Ledger sequence number
   * @returns Ledger details
   */
  async getLedger(sequence: number): Promise<Record<string, unknown>> {
    return this.rpcRequest('getLedger', { sequence });
  }
  
  /**
   * Get transaction details
   * 
   * @param txHash - Transaction hash
   * @returns Transaction details
   */
  async getTransaction(txHash: string): Promise<Record<string, unknown>> {
    return this.rpcRequest('getTransaction', { hash: txHash });
  }
  
  /**
   * Get contract data
   * 
   * @param contractId - Contract ID
   * @param key - Data key
   * @returns Contract data
   */
  async getContractData(
    contractId: string, 
    key: string
  ): Promise<Record<string, unknown>> {
    return this.rpcRequest('getContractData', {
      contractId,
      key,
    });
  }
  
  /**
   * Make an RPC request to the Soroban RPC server
   * 
   * @param method - RPC method name
   * @param params - Method parameters
   * @returns RPC response
   */
  private async rpcRequest(
    method: string, 
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.random().toString(36).substring(7),
          method,
          params,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
      }
      
      const result = await response.json() as { result?: Record<string, unknown> };
      return result.result || {};
    } catch (error) {
      console.error(`RPC request error: ${method}`, error);
      throw error;
    }
  }
  
  /**
   * Parse the events response from RPC
   * 
   * @param response - Raw RPC response
   * @returns Parsed events
   */
  private parseEventsResponse(
    response: Record<string, unknown>
  ): RawContractEvent[] {
    const events = response.events as Array<Record<string, unknown>> || [];
    
    return events.map((event, index) => ({
      id: `${(event.id as string) || index}-${Date.now()}`,
      type: (event.type as string) || 'unknown',
      ledger: Number(event.ledger) || 0,
      opIndex: Number(event.opIndex) || index,
      txIndex: Number(event.txIndex) || 0,
      txHash: (event.txHash as string) || '',
      contractId: (event.contractId as string) || '',
      topics: (event.topics as string[]) || [],
      data: (event.value as string) || '',
      timestamp: Number(event.timestamp) || Date.now(),
    }));
  }
  
  /**
   * Check if the RPC connection is healthy
   * 
   * @returns True if healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.rpcRequest('getLatestLedger');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory for creating StellarEventClient instances
 */
export class StellarClientFactory {
  /**
   * Create a client for the specified network
   * 
   * @param network - Network name ('mainnet', 'testnet', 'futurenet')
   * @returns Configured StellarEventClient
   */
  static createClient(network: 'mainnet' | 'testnet' | 'futurenet'): StellarEventClient {
    const config = this.getNetworkConfig(network);
    return new StellarEventClient(config);
  }
  
  /**
   * Get network configuration
   * 
   * @param network - Network name
   * @returns Network configuration
   */
  static getNetworkConfig(network: 'mainnet' | 'testnet' | 'futurenet'): NetworkConfig {
    const configs: Record<string, NetworkConfig> = {
      mainnet: {
        name: 'Stellar Mainnet',
        network: 'mainnet',
        horizonUrl: 'https://horizon.stellar.org',
        rpcUrl: 'https://soroban-rpc.stellar.org',
        passphrase: 'Public Global Stellar Network ; September 2015',
      },
      testnet: {
        name: 'Stellar Testnet',
        network: 'testnet',
        horizonUrl: 'https://horizon-testnet.stellar.org',
        rpcUrl: 'https://soroban-rpc-testnet.stellar.org',
        passphrase: 'Test SDF Network ; September 2015',
        friendbotUrl: 'https://friendbot.stellar.org',
      },
      futurenet: {
        name: 'Stellar Futurenet',
        network: 'futurenet',
        horizonUrl: 'https://horizon-futurenet.stellar.org',
        rpcUrl: 'https://soroban-rpc-futurenet.stellar.org',
        passphrase: 'Test SDF Future Network ; October 2022',
        friendbotUrl: 'https://friendbot-futurenet.stellar.org',
      },
    };
    
    return configs[network];
  }
}

/**
 * Default indexer configuration
 */
export const DEFAULT_INDEXER_CONFIG: IndexerConfig = {
  network: StellarClientFactory.getNetworkConfig('testnet'),
  pollingIntervalMs: 5000,
  batchSize: 50,
  rpcMaxRetries: 3,
  rpcRetryDelayMs: 1000,
  startLedger: undefined,
  contracts: [],
};