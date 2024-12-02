import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from './managed/identity/contract/index.cjs';

export type IdentityPrivateState = {
  readonly userData: Uint8Array;
};

export const createIdentityPrivateState = (userData: Uint8Array) => ({
  userData,
});


export function serializePrivateState(state: IdentityPrivateState): Uint8Array {
  return state.userData;
}

export const witnesses = {
  get_user_data: ({ privateState }: WitnessContext<Ledger, IdentityPrivateState>): [IdentityPrivateState, Uint8Array] => {
    // Return both the state and the user data
    return [privateState, privateState.userData];
  },
};
