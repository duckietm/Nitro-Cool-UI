import { GetRoomSessionManager, NitroEvent } from '@nitrots/nitro-renderer';
import { useEventDispatcher } from './useEventDispatcher';

export const useRoomSessionManagerEvent = <T extends NitroEvent>(type: string | string[], handler: (event: T) => void) => useEventDispatcher(type, GetRoomSessionManager().events, handler);
