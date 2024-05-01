import { FC } from 'react';
import { Flex, Text } from '..';

interface LayoutInputErrorViewProps
{
    text: string;
}

export const LayoutInputErrorView: FC<LayoutInputErrorViewProps> = props =>
{
    const { text = null } = props;
    
    return (
        <Flex className="nitro-input-error-popup" alignItems="center" justifyContent="center">
            <Text className="px-2">{ text }</Text>
        </Flex>
    );
};
