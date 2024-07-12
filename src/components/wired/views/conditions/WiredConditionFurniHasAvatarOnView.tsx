import { FC, useState } from 'react';
import { LocalizeText, WiredFurniType } from '../../../../api';
import { Column, Flex, Text } from '../../../../common';
import { WiredConditionBaseView } from './WiredConditionBaseView';

export const WiredConditionFurniHasAvatarOnView: FC<{}> = props => {
    const [requireAll, setRequireAll] = useState<number>(5); // Default to 5

    const handleRadioChange = (value: number) => {
        setRequireAll(value);
    };

    return (
        <WiredConditionBaseView
            requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_BY_ID}
            hasSpecialInput={false}
            save={null}
            maxItemSelectionCount={requireAll}
        >
            <Column gap={1}>
                <Text bold>{LocalizeText('wiredfurni.params.requireall.caption')}</Text>
                {[1, 5].map(value => (
                    <Flex key={value} gap={1} alignItems="center">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="requireAll"
                            id={`requireAll${value}`}
                            checked={requireAll === value}
                            onChange={() => handleRadioChange(value)}
                        />
                        <label className="text-black form-check-label" htmlFor={`requireAll${value}`}>
                            {value === 1
                                ? LocalizeText('wiredfurni.params.requireall.2')
                                : LocalizeText('wiredfurni.params.requireall.3')}
                        </label>
                    </Flex>
                ))}
            </Column>
        </WiredConditionBaseView>
    );
};
