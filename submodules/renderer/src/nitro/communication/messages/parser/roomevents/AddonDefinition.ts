import { IMessageDataWrapper } from '../../../../../api';
import { Triggerable } from './Triggerable';

export class AddonDefinition extends Triggerable
{
    private _code: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
        this._code = wrapper.readInt();
    }

    public get code(): number
    {
        return this._code;
    }
}
