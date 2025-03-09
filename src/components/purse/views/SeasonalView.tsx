import { FC } from 'react';
import { GetConfiguration, LocalizeFormattedNumber, LocalizeText } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface SeasonalViewProps
{
    type: number;
    amount: number;
}

export const SeasonalView: FC<SeasonalViewProps> = props =>
{
    const { type = -1, amount = -1 } = props;

    return (
        <Flex fullWidth justifyContent="between" className={ 'nitro-purse-seasonal-currency nitro-notification ' + GetConfiguration<boolean>('currency.seasonal.color') }>
            <Flex fullWidth>
                <Text bold truncate fullWidth variant="white" className="seasonal-padding seasonal-bold">{ LocalizeText(`purse.seasonal.currency.${ type }`) }</Text>
                <Text bold truncate variant="white" className="seasonal-amount text-end" title={ amount > 99999 ? LocalizeFormattedNumber(amount) : '' }>{ amount > 99999 ? '99 999' : LocalizeFormattedNumber(amount) }</Text>
                <Flex className="nitro-seasonal-box seasonal-padding">
                    <LayoutCurrencyIcon type={ type } />
                </Flex>        
            </Flex>            
        </Flex>

    );
}
