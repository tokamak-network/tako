'use client';

import * as React from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useSwitchChain } from 'wagmi';
import { sepolia } from '@reown/appkit/networks';

interface WalletConnectionContextValue {
  /** Whether the app has completed hydration and connection restoration */
  isReady: boolean;
  /** Whether the wallet is connected */
  isConnected: boolean;
  /** Connected wallet address */
  address: `0x${string}` | undefined;
}

const WalletConnectionContext = React.createContext<WalletConnectionContextValue | null>(null);

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, status } = useAppKitAccount();
  const [isReady, setIsReady] = React.useState(false);
  const { chainId: walletChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // Mark as ready when AppKit reaches a stable state
  React.useEffect(() => {
    const isStable = status === 'connected' || status === 'disconnected';
    if (isStable && !isReady) {
      setIsReady(true);
    }
  }, [status, isReady]);

  // Auto-switch to Sepolia when wallet is on an unsupported network
  React.useEffect(() => {
    if (!isReady || !isConnected || !walletChainId) return;
    if (walletChainId === sepolia.id || walletChainId === 1) return;
    switchChain({ chainId: sepolia.id });
  }, [walletChainId, isReady, isConnected, switchChain]);

  const value = React.useMemo(
    () => ({
      isReady,
      isConnected,
      address: address as `0x${string}` | undefined,
    }),
    [isReady, isConnected, address]
  );

  return (
    <WalletConnectionContext.Provider value={value}>
      {children}
    </WalletConnectionContext.Provider>
  );
}

export function useWalletConnection() {
  const context = React.useContext(WalletConnectionContext);
  if (!context) {
    throw new Error('useWalletConnection must be used within WalletConnectionProvider');
  }
  return context;
}
