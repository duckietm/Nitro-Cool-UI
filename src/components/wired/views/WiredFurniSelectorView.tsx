import { FC } from 'react';
import { LocalizeText } from '../../../api';
import { Column, Text } from '../../../common';
import { useWired } from '../../../hooks';

export interface WiredFurniSelectorViewProps {
    maxItemSelectionCount: number;
}

export const WiredFurniSelectorView: FC<WiredFurniSelectorViewProps> = props => {
    const { maxItemSelectionCount } = props;
    const { furniIds, selectObjectForWired } = useWired();

    // Enforce the selection limit
    const selectionText = LocalizeText('wiredfurni.pickfurnis.caption', ['count', 'limit'], [furniIds.length.toString(), maxItemSelectionCount.toString()]);

    const onSelectFurni = (furniId: number) => {
        selectObjectForWired(furniId, 0);
    };

    return (
        <Column gap={1}>
            <Text bold>{selectionText}</Text>
            <Text small>{LocalizeText('wiredfurni.pickfurnis.desc')}</Text>
        </Column>
    );
};
