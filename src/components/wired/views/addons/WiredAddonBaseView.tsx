import { FC, PropsWithChildren } from 'react';
import { WiredFurniType } from '../../../../api';
import { WiredBaseView } from '../WiredBaseView';

export interface WiredAddonBaseViewProps
{
    hasSpecialInput: boolean;
    requiresFurni: number;
    save: () => void;
}

export const WiredAddonBaseView: FC<PropsWithChildren<WiredAddonBaseViewProps>> = props =>
{
    const { requiresFurni = WiredFurniType.STUFF_SELECTION_OPTION_NONE, save = null, hasSpecialInput = false, children = null } = props;
    
    const onSave = () => (save && save());

    return (
        <WiredBaseView wiredType="addon" requiresFurni={ requiresFurni } hasSpecialInput={ hasSpecialInput } save={ onSave }>
            { children }
        </WiredBaseView>
    );
}
