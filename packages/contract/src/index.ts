// Re-export everything from the contract
export * from './managed/identity/contract/index.cjs';
export * from './witnesses';

// Ensure we're explicitly exporting the main types and functions
export type { Witnesses } from './managed/identity/contract/index.cjs';
export { Contract,  ledger } from './managed/identity/contract/index.cjs';