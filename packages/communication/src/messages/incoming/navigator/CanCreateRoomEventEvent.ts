import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { CanCreateRoomEventParser } from '../../parser';

export class CanCreateRoomEventEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CanCreateRoomEventParser);
    }

    public getParser(): CanCreateRoomEventParser
    {
        return this.parser as CanCreateRoomEventParser;
    }
}
