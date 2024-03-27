import { IMessageComposer } from '../../../../../../api';

export class FurniturePickupAllComposer implements IMessageComposer<ConstructorParameters<typeof FurniturePickupAllComposer>>
{
    private _data: ConstructorParameters<typeof FurniturePickupAllComposer>;

    constructor(...objectId: number[])
    {
        this._data = [objectId.length, ...objectId];
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
