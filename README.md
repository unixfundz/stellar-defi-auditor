# Stellar DeFi Auditor

<p align="center">
  <a href="https://github.com/stellar-defi-auditor/stellar-defi-auditor">
    <img src="https://img.shields.io/github/license/stellar-defi-auditor/stellar-defi-auditor" alt="License">
  </a>
  <a href="https://github.com/stellar-defi-auditor/stellar-defi-auditor/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/stellar-defi-auditor/stellar-defi-auditor/ci.yml" alt="Build">
  </a>
  <a href="https://www.npmjs.com/package/stellar-defi-auditor">
    <img src="https://img.shields.io/npm/v/stellar-defi-auditor" alt="NPM">
  </a>
  <a href="https://discord.gg/stellar-dao">
    <img src="https://img.shields.io/discord/1234567890" alt="Discord">
  </a>
</p>

A high-performance indexer for auditing financial movements on the Stellar/Soroban network. This project is similar to The Graph but specifically designed for tracking asset transfers, liquidity pool swaps, and contract-specific events on the Stellar blockchain.

## Features

- **Event Indexing**: Tracks Soroban contract events including transfers, swaps, and liquidity pool operations
- **Financial Auditing**: Maintains complete audit logs of all financial movements
- **Multi-Network Support**: Works with Stellar Mainnet, Testnet, and Futurenet
- **Real-time Polling**: Efficient event polling with configurable intervals
- **RESTful API**: Provides API endpoints for querying indexed data
- **TypeScript**: Full TypeScript support with strict typing
- **PostgreSQL + Prisma**: Robust data persistence with Prisma ORM

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Database**: PostgreSQL (v15+)
- **ORM**: Prisma
- **SDKs**: Stellar SDK
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v15 or higher
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/stellar-defi-auditor/stellar-defi-auditor.git
cd stellar-defi-auditor

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://stellar_audit:stellar_audit_pass@localhost:5432/stellar_financial_audit

# Network (mainnet, testnet, futurenet)
NETWORK=testnet

# RPC URLs
HORIZON_URL=https://horizon-testnet.stellar.org
RPC_URL=https://soroban-rpc-testnet.stellar.org

# Indexer Settings
POLLING_INTERVAL_MS=5000
BATCH_SIZE=50
RPC_MAX_RETRIES=3
LOG_LEVEL=info
```

### Running the Indexer

```bash
# Development
npm run dev

# Production (build first)
npm run build
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
npm run docker:build
npm run docker:up

# View logs
docker-compose logs -f indexer

# Stop services
npm run docker:down
```

## Project Structure

```
stellar-defi-auditor/
├── src/
│   ├── mappings/          # Event handlers and data transformation
│   ├── ingestor/        # RPC client and polling logic
│   ├── types/         # TypeScript type definitions
│   ├── schema/        # GraphQL/schema definitions
│   └── index.ts      # Application entry point
├── config/             # Configuration files
├── prisma/            # Database schema
├── tests/             # Unit tests
├── docker-compose.yml   # Docker composition
├── package.json     # Dependencies
├── tsconfig.json  # TypeScript config
└── README.md       # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/health` | Health check |
| GET | `/events` | List contract events |
| GET | `/events/:id` | Get event by ID |
| GET | `/transactions` | List transactions |
| GET | `/transactions/:hash` | Get transaction by hash |
| GET | `/audit-logs` | List audit logs |
| GET | `/audit-logs/:id` | Get audit log by ID |
| GET | `/contracts` | List tracked contracts |
| POST | `/contracts` | Add new contract |

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.

## Support

- Discord: [Stellar DAO Discord](https://discord.gg/stellar-dao)
- Issues: [GitHub Issues](https://github.com/stellar-defi-auditor/stellar-defi-auditor/issues)
- Stellar Developers: [Stellar Developer Hub](https://developers.stellar.org)