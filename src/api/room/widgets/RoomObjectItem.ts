export class RoomObjectItem
{
    private _id: number;
    private _category: number;
    private _name: string;
    private _ownerId: number;
    private _ownerName: string;
    private _type?: string;

    constructor( id: number, category: number, name: string, ownerId: number = 0, ownerName: string = '#', type?: string )
    {
        this._id = id;
        this._category = category;
        this._name = name;
        this._ownerId = ownerId;
        this._ownerName = ownerName;
        this._type = type;
    }

    public get id(): number { 
		return this._id;
	}
	
    public get category(): number {
		return this._category;
	}
    
	public get name(): string {
		return this._name;
	}
    
	public get ownerId(): number {
		return this._ownerId;
	}
    
	public get ownerName(): string {
		return this._ownerName ?? '#';
	}
    
	public get type(): string {
		return this._type ?? '-';
	}
}