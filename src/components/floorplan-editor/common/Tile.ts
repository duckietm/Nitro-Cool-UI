export class Tile
{
    private _height: string;
    private _isBlocked: boolean;
    private _selected: boolean; // new property

    constructor(height: string, isBlocked: boolean)
    {
        this._height = height;
        this._isBlocked = isBlocked;
        this._selected = false; // default to not selected
    }

    public get height(): string
    {
        return this._height;
    }

    public set height(height: string)
    {
        this._height = height;
    }

    public get isBlocked(): boolean
    {
        return this._isBlocked;
    }

    public set isBlocked(val: boolean)
    {
        this._isBlocked = val;
    }

    public get selected(): boolean
    {
        return this._selected;
    }

    public set selected(value: boolean)
    {
        this._selected = value;
    }
}
