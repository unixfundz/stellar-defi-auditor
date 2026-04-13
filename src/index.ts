/**
 * Application Entry Point - Stellar Financial Audit Indexer
 * 
 * @author Stellar DeFi Auditor Team
 * @version 1.0.0
 */

// Import environment configuration
import * as dotenv from 'dotenv';
dotenv.config();

import { logger } from './config/logger';
import { StellarEventClient, StellarClientFactory } from './ingestor/stellar-client';
import { parseSorobanContractEvent, validateEvent } from './mappings/handlers';

// Application configuration interface
interface AppConfig {
  network: 'mainnet' | 'testnet' | 'futurenet';
  port: number;
  pollingIntervalMs: number;
  batchSize: number;
}

/**
 * Main application class
 */
class StellarDefiAuditor {
  private client: StellarEventClient;
  private config: AppConfig;
  private isRunning: boolean = false;
  
  constructor(config: AppConfig) {
    this.config = config;
    const networkConfig = StellarClientFactory.getNetworkConfig(config.network);
    this.client = new StellarEventClient(networkConfig);
    
    logger.info('Stellar DeFi Auditor initialized'), {
      network: config.network,
      port: config.port,
    });
  }
  
  /**
   * Start the indexer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Indexer is already running');
      return;
    }
    
    this.isRunning = true;
    logger.info('Starting Stellar DeFi Auditor...'));
    
    // Check RPC connection
    const isHealthy = await this.client.healthCheck();
    if (!isHealthy) {
      logger.error('RPC connection check failed');
      throw new Error('RPC connection unavailable');
    }
    
    // Get latest ledger
    const latestLedger = await this.client.getLatestLedger();
    logger.info('Connected to network', { latestLedger });
    
    // Start polling
    this.startPolling();
  }
  
  /**
   * Stop the indexer
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    logger.info('Stopping Stellar DeFi Auditor...'));
  }
  
  /**
   * Start polling for events
   */
  private startPolling(): void {
    // Placeholder for polling logic
    logger.info('Event polling started', {
      interval: this.config.pollingIntervalMs,
      batchSize: this.config.batchSize,
    });
    
    // This would be implemented with setInterval or a worker queue
    setInterval(async () => {
      try {
        await this.pollEvents();
      } catch (error) {
        logger.error('Error polling events', { error });
      }
    }, this.config.pollingIntervalMs);
  }
  
  /**
   * Poll for events
   */
  private async pollEvents(): Promise<void> {
    // Placeholder implementation
    const events = await this.client.fetchEvents(
      'CA000000000000000000000000000000000000000000000000000000',
      'now',
      this.config.batchSize
    );
    
    for (const rawEvent of events) {
      const event = parseSorobanContractEvent(rawEvent);
      
      if (validateEvent(event)) {
        logger.debug('Processing event', {
          id: event.id,
          type: event.eventType,
          ledger: event.ledger,
        });
        
        // Process event - save to database, create audit logs, etc.
      }
    }
  }
}

// Health check endpoint
async function healthCheck(): Promise<{ status: string; version: string }> {
  return {
    status: 'healthy',
    version: '1.0.0',
  };
}

// Main execution
async function main(): Promise<void> {
  const config: AppConfig = {
    network: (process.env.NETWORK as AppConfig['network']) || 'testnet',
    port: parseInt(process.env.API_PORT || '3000', 10),
    pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '5000', 10),
    batchSize: parseInt(process.env.BATCH_SIZE || '50', 10),
  };
  
  const app = new StellarDefiAuditor(config);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    await app.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    await app.stop();
    process.exit(0);
  });
  
  // Start the application
  await app.start();
  
  logger.info('Stellar DeFi Auditor is running'));
}

// Export for testing
export { StellarDefiAuditor, healthCheck };

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}