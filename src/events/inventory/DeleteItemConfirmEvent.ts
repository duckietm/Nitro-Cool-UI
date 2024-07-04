import { FurnitureItem } from '../../api';
import { NitroEvent } from '@nitrots/nitro-renderer';

export class DeleteItemConfirmEvent extends NitroEvent
{
    public static DELETE_ITEM_CONFIRM = 'DIC_DELETE_ITEM_CONFIRM';
    
    private _item: FurnitureItem;
    private _amount: number;

    constructor(item: FurnitureItem, amount: number)
    {
        super(DeleteItemConfirmEvent.DELETE_ITEM_CONFIRM);
        this._item = item;
        this._amount = amount;
    }

    public get item(): FurnitureItem
    {
        return this._item;
    }

    public get amount(): number
    {
        return this._amount;
    }
}