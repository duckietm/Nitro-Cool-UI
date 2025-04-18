import { IMessageDataWrapper, IMessageParser } from '../../../../../../api';

export class RoomUnitInfoParser implements IMessageParser
{
    private _unitId: number;
    private _figure: string;
    private _gender: string;
    private _motto: string;
    private _achievementScore: number;
    private _backgroundId: number;
    private _standId: number;
    private _overlayId: number;

    public flush(): boolean
    {
        this._unitId = null;
        this._figure = null;
        this._gender = 'M';
        this._motto = null;
        this._achievementScore = 0;
        this._backgroundId = 0;
        this._standId = 0;
        this._overlayId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._unitId = wrapper.readInt();
        this._figure = wrapper.readString();
        this._gender = wrapper.readString().toLocaleUpperCase();
        this._motto = wrapper.readString();
        this._achievementScore = wrapper.readInt();
        this._backgroundId = wrapper.readInt();
        this._standId = wrapper.readInt();
        this._overlayId = wrapper.readInt();

        return true;
    }

    public get unitId(): number
    {
        return this._unitId;
    }

    public get figure(): string
    {
        return this._figure;
    }

    public get gender(): string
    {
        return this._gender;
    }

    public get motto(): string
    {
        return this._motto;
    }

    public get achievementScore(): number
    {
        return this._achievementScore;
    }

    public get backgroundId(): number
    {
        return this._backgroundId;
    }

    public get standId(): number
    {
        return this._standId;
    }

    public get overlayId(): number
    {
        return this._overlayId;
    }
}
