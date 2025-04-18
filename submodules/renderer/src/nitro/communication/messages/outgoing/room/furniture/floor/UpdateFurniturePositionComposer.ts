import { IMessageComposer } from '../../../../../../../api';

export class UpdateFurniturePositionComposer implements IMessageComposer<ConstructorParameters<typeof UpdateFurniturePositionComposer>>
{
    private _data: ConstructorParameters<typeof UpdateFurniturePositionComposer>;

    constructor(itemId: number, x: number, y: number, z: number, direction: number)
    {
        this._data = [itemId, x, y, z, direction];
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
