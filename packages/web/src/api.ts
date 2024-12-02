import { Contract, createIdentityPrivateState, ledger, Witnesses } from '@midnight-kyc-demo/contract';
import { deployContract, findDeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { witnesses, IdentityPrivateState } from '@midnight-kyc-demo/contract';
import { CoinInfo, type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import {
  type BalancedTransaction,
  createBalancedTx,
  // type MidnightProvider,
  type UnbalancedTransaction,
  // type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
// import { type Wallet } from '@midnight-ntwrk/wallet-api';
// import { type Resource, WalletBuilder } from '@midnight-ntwrk/wallet';
import { DAppConnectorWalletAPI, DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';
// import { type ServiceUriConfig } from '@midnight-ntwrk/dapp-connector-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
// import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { TransactionId, Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Transaction } from '@midnight-ntwrk/ledger';

// export const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');

export type PrivateStates = {
  readonly identityPrivateState: IdentityPrivateState;
};

export type IdentityContract = Contract<IdentityPrivateState, Witnesses<IdentityPrivateState>>;

export type IdentityCircuitKeys = Exclude<keyof IdentityContract['impureCircuits'], number | symbol>;

export type IdentityProviders = MidnightProviders<IdentityCircuitKeys, PrivateStates>;

export type DeployedIdentityContract = FoundContract<IdentityPrivateState, IdentityContract>;

const identityContractInstance: IdentityContract = new Contract(witnesses);

export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

export async function getPrivateState(providers: IdentityProviders): Promise<IdentityPrivateState> {
  const existingPrivateState = await providers.privateStateProvider.get('identityPrivateState');
  return existingPrivateState ?? createIdentityPrivateState(randomBytes(32));
}

export const initializeProviders = async (wallet: DAppConnectorWalletAPI): Promise<IdentityProviders | undefined> => {
  if (!window.midnight?.mnLace) {
    return;
  }

  const walletState = await wallet.state();
  const uris = await window.midnight.mnLace.serviceUriConfig();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'bboard-private-state',
    }),
    zkConfigProvider: new FetchZkConfigProvider<IdentityCircuitKeys>(window.location.origin, fetch.bind(window)),
    // zkConfigProvider: new NodeZkConfigProvider<IdentityCircuitKeys>(path.resolve(currentDir, '..', '..', 'contract', 'dist', 'managed', 'identity')),
    // zkConfigProvider: new FetchZkConfigProvider<IdentityCircuitKeys>(
    //   '/home/manuelpadilla/sources/reposUbuntu/CARDANO/midnight-identity-voting/packages/contract/dist/managed/identity/keys',
    // ),

    // zkConfigProvider = path.resolve(currentDir, '..', '..', 'contract', 'dist', 'managed', 'bboard');
    // zkConfigProvider: new FetchZkConfigProvider(window.location.origin, fetch.bind(window)),
    // zkConfigProvider: new NodeZkConfigProvider<'increment'>(contractConfig.zkConfigPath),
    // zkConfigProvider: new NodeZkConfigProvider<'post' | 'take_down'>(config.zkConfigPath),

    proofProvider: httpClientProofProvider(uris.proverServerUri),
    publicDataProvider: indexerPublicDataProvider(uris.indexerUri, uris.indexerWsUri),
    walletProvider: {
      coinPublicKey: walletState.coinPublicKey,
      balanceTx(tx: UnbalancedTransaction, newCoins: CoinInfo[]): Promise<BalancedTransaction> {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
            newCoins,
          )
          .then((tx) => wallet.proveTransaction(tx))
          .then((zswapTx) => {
            const deserializedTx = Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId(),
            );

            // Asegúrate de que `deserializedTx` tenga las propiedades requeridas
            if (!deserializedTx.wellFormed || !deserializedTx.contractCalls) {
              throw new Error('Transaction is not well-formed or missing contract calls.');
            }

            return createBalancedTx(deserializedTx);
          });
      },
    },
    midnightProvider: {
      submitTx(tx: BalancedTransaction): Promise<TransactionId> {
        return wallet.submitTransaction(tx);
      },
    },
  };
};

export async function deployKYCContract(providers: IdentityProviders): Promise<DeployedIdentityContract> {
  try {
    // Deploy the contract using the provided providers and initial private state
    const deployedContract = await deployContract(providers, {
      privateStateKey: 'identityPrivateState',
      contract: identityContractInstance,
      initialPrivateState: await getPrivateState(providers),
    });

    // Return the contract address of the deployed contract
    return deployedContract;
  } catch (error) {
    console.error('Error deploying KYC contract:', error);
    throw error;
  }
}

/**
 * Queries the current state of the contract from the ledger.
 * @param state - The contract state on the network.
 * @returns The processed contract state.
 */
export function getLedgerState(state: any) {
  try {
    // Get the ledger state from the provided contract state
    return ledger(state.data);
  } catch (error) {
    console.error('Error getting ledger state:', error);
    throw error;
  }
}
