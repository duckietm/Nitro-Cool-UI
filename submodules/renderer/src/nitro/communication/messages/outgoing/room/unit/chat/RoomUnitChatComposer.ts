import { IMessageComposer } from '../../../../../../../api';

export class RoomUnitChatComposer implements IMessageComposer<ConstructorParameters<typeof RoomUnitChatComposer>>
{
    private _data: ConstructorParameters<typeof RoomUnitChatComposer>;

    constructor(message: string, styleId: number = 0, chatColour: string = '')
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
