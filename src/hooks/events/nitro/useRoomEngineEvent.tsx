import { GetRoomEngine, NitroEvent } from '@nitrots/nitro-renderer';
import { useEventDispatcher } from '../useEventDispatcher';

export const useRoomEngineEvent = <T extends NitroEvent>(type: string | string[], handler: (event: T) => void) => useEventDispatcher(type, GetRoomEngine().events, handler);
