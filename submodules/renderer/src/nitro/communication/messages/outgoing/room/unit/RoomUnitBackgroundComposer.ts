import { IMessageComposer } from '../../../../../../api';

export class RoomUnitBackgroundComposer implements IMessageComposer<ConstructorParameters<typeof RoomUnitBackgroundComposer>>
{
    private _data: ConstructorParameters<typeof RoomUnitBackgroundComposer>;

    constructor(backgroundImage: number, backgroundStand: number, backgroundOverlay: number)
    {
        this._data = [ backgroundImage, backgroundStand, backgroundOverlay ];
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
