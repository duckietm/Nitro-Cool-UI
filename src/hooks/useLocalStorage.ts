import { NitroLogger } from '@nitrots/nitro-renderer';
import { Dispatch, SetStateAction, useState } from 'react';
import { GetLocalStorage, SetLocalStorage } from '../api';

const userId = new URLSearchParams(window.location.search).get('userid') || 0;

const useLocalStorageState = <T>(key: string, initialValue: T): [ T, Dispatch<SetStateAction<T>>] =>
{
    key = userId ? `${ key }.${ userId }` : key;
    
    const [ storedValue, setStoredValue ] = useState<T>(() =>
    {
        try
        {
            const item = typeof window !== 'undefined' ? GetLocalStorage<T>(key) as T : undefined;
            return item ?? initialValue;
        }

        catch(error)
        {
            return initialValue;
        }
    });

    const setValue = (value: T) =>
    {
        try
        {
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if(typeof window !== 'undefined') SetLocalStorage(key, valueToStore);
        }

        catch(error)
        {
            NitroLogger.error(error);
        }
    }

    return [ storedValue, setValue ];
}

export const useLocalStorage = useLocalStorageState;
