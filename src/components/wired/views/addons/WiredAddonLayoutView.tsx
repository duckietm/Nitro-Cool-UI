import { WiredAddonOneCondition } from './WiredAddonOneCondition';

export const WiredAddonLayoutView = (code: number) =>
{
    switch(code)
    {
        case 0:
            return <WiredAddonOneCondition/>
    }

    return null;
}
