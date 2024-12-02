import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from './managed/identity/contract/index.cjs';
export type IdentityPrivateState = {
    readonly userData: Uint8Array;
};
export declare const createIdentityPrivateState: (userData: Uint8Array) => {
    userData: Uint8Array<ArrayBufferLike>;
};
export declare function serializePrivateState(state: IdentityPrivateState): Uint8Array;
export declare const witnesses: {
    get_user_data: ({ privateState }: WitnessContext<Ledger, IdentityPrivateState>) => [IdentityPrivateState, Uint8Array];
};
