import { IMessageComposer } from '../../../../../../../api';

export class FurnitureClickComposer implements IMessageComposer<ConstructorParameters<typeof FurnitureClickComposer>>
{
    private _data: ConstructorParameters<typeof FurnitureClickComposer>;

    constructor(itemId: number)
    {
        this._data = [itemId];
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
