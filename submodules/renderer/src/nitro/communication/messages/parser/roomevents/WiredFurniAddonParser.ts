import { IMessageDataWrapper, IMessageParser } from '../../../../../api';
import { AddonDefinition } from './AddonDefinition';

export class WiredFurniAddonParser implements IMessageParser
{
    private _definition: AddonDefinition;

    public flush(): boolean
    {
        this._definition = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._definition = new AddonDefinition(wrapper);

        return true;
    }

    public get definition(): AddonDefinition
    {
        return this._definition;
    }
}
