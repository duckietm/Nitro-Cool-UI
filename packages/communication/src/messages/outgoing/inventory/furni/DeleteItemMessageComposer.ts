import { IMessageComposer } from '../../../../../../api';

export class DeleteItemMessageComposer implements IMessageComposer<ConstructorParameters<typeof DeleteItemMessageComposer>>
{
    private _data: ConstructorParameters<typeof DeleteItemMessageComposer>;

    constructor(itemId: number, amount: number)
    {
        this._data = [itemId, amount];
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
