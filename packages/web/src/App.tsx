import { useState } from 'react';
import { DAppConnectorWalletAPI, DAppConnectorAPI, DAppConnectorWalletState } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as pino from 'pino';
import { createIdentityPrivateState } from '@midnight-kyc-demo/contract';
import { DeployedIdentityContract, deployKYCContract, initializeProviders } from './api';


declare global {
  interface Window {
    midnight?: { [key: string]: DAppConnectorAPI };
  }
}

const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
setNetworkId(networkId);
console.log('Network ID:', networkId);


export const logger = pino.pino({
  level: import.meta.env.VITE_LOGGING_LEVEL as string,
});

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [api, setApi] = useState<DAppConnectorWalletAPI | null>(null);
  const [status, setStatus] = useState('');
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<DeployedIdentityContract | null>(null);
  const [walletState, setwalletState] = useState<DAppConnectorWalletState | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.midnight?.mnLace) {
        setStatus('Please install Midnight Lace wallet');
        return;
      }

      const walletApi = await window.midnight.mnLace.enable();
      setApi(walletApi);
      const walletState = await walletApi.state();
      setwalletState(walletState);

      setIsConnected(true);
      setStatus('Wallet connected successfully');
    } catch (error) {
      setStatus('Failed to connect wallet: ' + (error as Error).message);
    }
  };

  const deployContractHandler = async () => {
    try {
      if (!isConnected || !api) {
        setStatus('Please connect your wallet first.');
        return;
      }

      setStatus('Initializing providers...');
      console.log('Initializing providers...');
      
      console.log('api', api);

      const providers = await initializeProviders(api);
      console.log('providers', providers);

      if (!providers) {
        setStatus('Failed to initialize providers');
        return;
      }

      setStatus('Deploying contract...');
      console.log('Deploying contract...');

      const deployedContract = await deployKYCContract(providers);
      setContract(deployedContract);
      setContractAddress(deployedContract.deployTxData.public.contractAddress);
      setStatus(`Contract deployed! Address: ${deployedContract.deployTxData.public.contractAddress}`);
    } catch (error) {
      setStatus('Failed to deploy contract: ' + (error as Error).message);
    }
  };

  const submitKYC = async () => {
    try {
      if (!api || !contract) {
        setStatus('Please connect wallet and deploy contract first');
        return;
      }

      // // Example KYC data - in a real app this would be actual user data
      // const kycData = new TextEncoder().encode('example-kyc-data');

      // setStatus('Submitting KYC proof...');

      // // Call the submit_kyc circuit
      // const tx = await contract.callTx.submit_kyc();

      // setStatus(`KYC submitted! Transaction: ${tx.public.txHash}`);
    } catch (error) {
      setStatus('Failed to submit KYC: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Midnight KYC Demo</h1>

      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Wallet Connected ✅</p>
          <p>Address: {walletState?.address}</p>
          {!contractAddress ? (
            <button onClick={deployContractHandler}>Deploy Contract</button>
          ) : (
            <button onClick={submitKYC}>Submit KYC</button>
          )}
        </div>
      )}

      {status && <p style={{ marginTop: '20px' }}>{status}</p>}
    </div>
  );
}

export default App;
