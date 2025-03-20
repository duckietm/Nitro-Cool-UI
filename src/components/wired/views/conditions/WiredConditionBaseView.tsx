import { FC, PropsWithChildren } from 'react';
import { WiredFurniType } from '../../../../api';
import { WiredBaseView } from '../WiredBaseView';

export interface WiredConditionBaseViewProps {
    hasSpecialInput: boolean;
    requiresFurni: number;
    save: () => void;
    maxItemSelectionCount?: number; // Optional parameter
}

export const WiredConditionBaseView: FC<PropsWithChildren<WiredConditionBaseViewProps>> = props => {
    const { requiresFurni = WiredFurniType.STUFF_SELECTION_OPTION_NONE, save = null, hasSpecialInput = false, children = null, maxItemSelectionCount = 50 } = props;
    
    const onSave = () => (save && save());

    return (
        <WiredBaseView 
            wiredType="condition" 
            requiresFurni={requiresFurni} 
            hasSpecialInput={hasSpecialInput} 
            save={onSave} 
            maxItemSelectionCount={maxItemSelectionCount}>
            {children}
        </WiredBaseView>
    );
}