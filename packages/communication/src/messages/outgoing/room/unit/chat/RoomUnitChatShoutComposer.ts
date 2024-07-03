import { IMessageComposer } from '@nitrots/api';

export class RoomUnitChatShoutComposer implements IMessageComposer<ConstructorParameters<typeof RoomUnitChatShoutComposer>>
{
    private _data: ConstructorParameters<typeof RoomUnitChatShoutComposer>;

    constructor(message: string, styleId: number, chatColour: string)
    {
        this._data = [message, styleId, chatColour];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
