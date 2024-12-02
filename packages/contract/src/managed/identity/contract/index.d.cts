import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum KYCStatus { unverified = 0, verified = 1 }

export type Witnesses<T> = {
  get_user_data(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  submit_kyc(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
  verify_kyc(context: __compactRuntime.CircuitContext<T>, user_hash: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  submit_kyc(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
  verify_kyc(context: __compactRuntime.CircuitContext<T>, user_hash: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
}

export type Ledger = {
  readonly verificationStatus: KYCStatus;
  readonly userHash: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
