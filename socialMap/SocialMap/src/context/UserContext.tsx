import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import {JsonRpcProvider, Wallet} from 'ethers';
import useStorage from '../hooks/useStorage';

export const LSAccountKey = 'one_map_client_account';

interface UserContextType {
  wallet: Wallet | undefined;
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

let forceGenerateNewWallet = false;

const UserProvider: React.FC<UserProviderProps> = ({children}) => {
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const {setValue, getValue} = useStorage();
  const privateKeyLS = getValue(LSAccountKey) || '';

  useEffect(() => {
    if (wallet && !forceGenerateNewWallet) {
      return;
    }
    if (privateKeyLS && !forceGenerateNewWallet) {
      try {
        const data = getWalletFromPrivateKey(privateKeyLS);
        setWallet(data);
        console.log('[user context] Restored blockchain address');
      } catch (error) {
        console.error(
          '[user context] Failed to load user wallet from localStorage:',
          error,
        );
      }
    } else {
      const newWallet = createRandomWallet();
      setWallet(newWallet);
      setValue(LSAccountKey, newWallet.privateKey);

      forceGenerateNewWallet = false;
    }
  }, [privateKeyLS, setValue, wallet]);

  const value = useMemo<UserContextType>(
    () => ({wallet, setWallet}),
    [wallet, setWallet],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const createRandomWallet = (): Wallet => {
  const hdWallet = Wallet.createRandom();
  return getWalletFromPrivateKey(hdWallet.privateKey);
};

const getWalletFromPrivateKey = (privateKey: string): Wallet => {
  const provider = new JsonRpcProvider();
  return new Wallet(privateKey, provider);
};

export {useUserContext, UserProvider};
