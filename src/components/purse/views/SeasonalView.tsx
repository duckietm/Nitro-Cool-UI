import { FC } from 'react';
import { GetConfiguration, LocalizeFormattedNumber, LocalizeText } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface SeasonalViewProps {
    type: number;
    amount: number;
}

// Individual currency display component
export const SeasonalView: FC<SeasonalViewProps> = props => {
    const { type = -1, amount = -1 } = props;

    return (
        <Flex fullWidth justifyContent="between" className={`nitro-purse-seasonal-currency nitro-notification ${GetConfiguration<boolean>('currency.seasonal.color')}`} >
            <Flex fullWidth>
                <Text bold truncate fullWidth variant="white" className="seasonal-padding seasonal-bold" >
                    {LocalizeText(`purse.seasonal.currency.${type}`)}
                </Text>
                <Text bold truncate variant="white" className="seasonal-amount text-end" title={amount > 99999 ? LocalizeFormattedNumber(amount) : '' } >
                    {amount > 99999 ? '99 999' : LocalizeFormattedNumber(amount)}
                </Text>
                <Flex className="nitro-seasonal-box seasonal-padding">
                    <LayoutCurrencyIcon type={type} />
                </Flex>        
            </Flex>            
        </Flex>
    );
};

interface SeasonalCurrenciesViewProps {
    currencies: { type: number; amount: number }[];
}

export const SeasonalCurrenciesView: FC<SeasonalCurrenciesViewProps> = props => {
    const { currencies } = props;

    // Sort currencies: 0 first, then 5, then others
    const sortedCurrencies = [...currencies].sort((a, b) => {
        if (a.type === 0) return -1;
        if (b.type === 0) return 1;
        if (a.type === 5) return -1;
        if (b.type === 5) return 1;
        return a.type - b.type;
    });

    return (
        <Flex column gap={2}>
            {
				sortedCurrencies.map(currency => (<SeasonalView key={currency.type} type={currency.type} amount={currency.amount} />))
			}
        </Flex>
    );
};