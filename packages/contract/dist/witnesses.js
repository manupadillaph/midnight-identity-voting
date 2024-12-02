export const createIdentityPrivateState = (userData) => ({
    userData,
});
export function serializePrivateState(state) {
    return state.userData;
}
export const witnesses = {
    get_user_data: ({ privateState }) => {
        // Return both the state and the user data
        return [privateState, privateState.userData];
    },
};
// // This is how we type an empty object.
// export type IdentityPrivateState = Record<string, never>;
// export const witnesses = {};
//# sourceMappingURL=witnesses.js.map