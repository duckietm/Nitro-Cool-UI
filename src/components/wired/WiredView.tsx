import { AddonDefinition, ConditionDefinition, TriggerDefinition, WiredActionDefinition } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { useWired } from '../../hooks';
import { WiredActionLayoutView } from './views/actions/WiredActionLayoutView';
import { WiredAddonLayoutView } from './views/addons/WiredAddonLayoutView';
import { WiredConditionLayoutView } from './views/conditions/WiredConditionLayoutView';
import { WiredTriggerLayoutView } from './views/triggers/WiredTriggerLayoutView';

export const WiredView: FC<{}> = props =>
{
    const { trigger = null } = useWired();

    if(!trigger) return null;

    if(trigger instanceof WiredActionDefinition) return WiredActionLayoutView(trigger.code);

    if(trigger instanceof TriggerDefinition) return WiredTriggerLayoutView(trigger.code);
    
    if(trigger instanceof ConditionDefinition) return WiredConditionLayoutView(trigger.code);

    if (trigger instanceof AddonDefinition) return WiredAddonLayoutView(trigger.code);
    
    return null;
};
