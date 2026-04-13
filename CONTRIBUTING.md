# Contributing to Stellar Financial Audit

Thank you for your interest in contributing! This document outlines the guidelines for contributing to the Stellar Financial Audit project.

## Code of Conduct

By participating in this project, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with the bug template
3. Include steps to reproduce, expected behavior, and actual behavior
4. Include relevant logs and screenshots

### Suggesting Features

1. Check the feature requests repository for existing suggestions
2. Create a new issue with the feature template
3. Describe the feature and its use case
4. Include any relevant mockups or technical specifications

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Create a Pull Request

## Development Setup

### Prerequisites

- Node.js v18+
- PostgreSQL v15+
- Docker (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/stellar-defi-auditor/stellar-defi-auditor.git
cd stellar-defi-auditor

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Coding Standards

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use proper TypeScript types (no `any`)
- Use interfaces over types for objects

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use trailing commas

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` with `I` prefix (optional)

### Git Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(ingestor): add Soroban RPC event streaming

Add support for streaming events from Soroban RPC instead of polling.
This improves real-time event processing by up to 50%.

Closes #123
```

## Adding New Indexers

### Step 1: Create Handler

Create a new handler in `src/mappings/handlers.ts`:

```typescript
export function handleNewEventType(
  event: ContractEvent
): Omit<AuditLog, 'id' | 'createdAt'> {
  // Transform event to audit log
  return {
    eventType: 'custom',
    contractId: event.contractId,
    transactionHash: event.txHash,
    ledger: event.ledger,
    metadata: event.payload,
    status: 'pending',
  };
}
```

### Step 2: Update Schema

Add new model to `prisma/schema.prisma`:

```prisma
model NewEvent {
  id        String   @id @default(uuid())
  eventType String
  // Add more fields
  createdAt DateTime @default(now())
}
```

### Step 3: Update Types

Add new types to `src/types/index.ts`:

```typescript
export interface NewEvent {
  id: string;
  eventType: string;
  // Add more fields
}
```

## Testing

### Writing Tests

Follow the Arrange-Act-Assert pattern:

```typescript
describe('parseEventType', () => {
  it('should parse transfer events', () => {
    // Arrange
    const input = 'transfer';
    
    // Act
    const result = parseEventType(input);
    
    // Assert
    expect(result).toBe('transfer');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Documentation

### Code Documentation

Use JSDoc for documentation:

```typescript
/**
 * Parses a raw Soroban contract event into a structured ContractEvent
 * 
 * @param rawEvent - The raw event data from the RPC provider
 * @returns Parsed ContractEvent object
 * 
 * @example
 * ```typescript
 * const event = parseSorobanContractEvent(rawEvent);
 * console.log(event.eventType);
 * ```
 */
export function parseSorobanContractEvent(rawEvent: RawContractEvent): ContractEvent {
  // Implementation
}
```

### README Updates

Update the README when adding:
- New features
- API endpoints
- Configuration options

## Review Process

1. All submissions require review
2. Address feedback promptly
3. Request re-review after changes
4. Squash commits before merging

## Recognition

Contributors will be added to the [CONTRIBUTORS](CONTRIBUTORS) file.

## Questions?

- Open an issue
- Join our Discord
- Email the maintainers

Thank you for contributing!