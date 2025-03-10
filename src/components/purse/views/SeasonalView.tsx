import { FC } from 'react';
import { GetConfigurationValue, LocalizeFormattedNumber, LocalizeText } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface SeasonalViewProps {
  type: number;
  amount: number;
}

export const SeasonalView: FC<SeasonalViewProps> = props => {
  const { type = -1, amount = -1 } = props;
  const seasonalColor = GetConfigurationValue<string>('currency.seasonal.color', 'blue');

  return (
    <Flex
      fullWidth
      justifyContent="between"
      className={`nitro-purse-seasonal-currency nitro-notification ${seasonalColor}`}
    >
      <Flex fullWidth>
        <Text truncate fullWidth variant="white" className="seasonal-text-padding seasonal-text">
          {LocalizeText(`purse.seasonal.currency.${type}`)}
        </Text>
        <Text
          truncate
          variant="white"
          className="seasonal-amount text-end"
          title={amount > 99999 ? LocalizeFormattedNumber(amount) : ''}
        >
          {amount > 99999 ? '99 999' : LocalizeFormattedNumber(amount)}
        </Text>
        <Flex className="nitro-seasonal-box seasonal-image-padding">
          <LayoutCurrencyIcon type={type} />
        </Flex>
      </Flex>
    </Flex>
  );
};