import { IMessageEvent } from '../../../../../api';
import { MessageEvent } from '../../../../../events';
import { WiredFurniAddonParser } from '../../parser/roomevents/WiredFurniAddonParser';

export class WiredFurniAddonEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredFurniAddonParser);
    }

    public getParser(): WiredFurniAddonParser
    {
        return this.parser as WiredFurniAddonParser;
    }
}
