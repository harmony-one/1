import {useEffect, useState} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {MMKV} from 'react-native-mmkv';

type Storage = MMKV | null;

interface StorageType {
  setValue: (key: string, value: string) => void;
  getValue: (key: string) => string | null | undefined;
  removeValue: (key: string) => void;
}

// TODO: migrate to https://react-native-async-storage.github.io/async-storage/docs/install
const useStorage = (): StorageType => {
  const [storage, setStorage] = useState<Storage>(null);

  useEffect(() => {
    const initializeMMKV = async () => {
      const userId = (await getUniqueId()) || '';
      const mmkvInstance = new MMKV({
        id: `${userId}-storage`,
        path: 'one-map-storage/storage',
      });

      setStorage(mmkvInstance);
    };

    initializeMMKV();
  }, []);

  const setValue = (key: string, value: string) => {
    if (storage) {
      storage.set(key, value);
    }
  };

  const getValue = (key: string) => {
    if (storage) {
      const value = storage.getString(key);
      return value;
    }
    return null;
  };

  const removeValue = (key: string) => {
    if (storage) {
      storage.delete(key);
    }
  };

  return {
    setValue,
    getValue,
    removeValue,
  };
};

export default useStorage;