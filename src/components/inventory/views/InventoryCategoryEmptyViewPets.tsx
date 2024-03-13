import { FC } from 'react';
import { CreateLinkEvent, LocalizeText } from '../../../api';
import { Button, Column, Flex, Grid, GridProps, Text } from '../../../common';

export interface InventoryCategoryEmptyViewPets extends GridProps
{
    title: string;
    desc: string;
	isTrading?: boolean;
}

export const InventoryCategoryEmptyViewPets: FC< InventoryCategoryEmptyViewBotsProps> = (props) => {
  const { title = '', desc = '', isTrading = false, children = null, ...rest } = props;

  return (
    <Grid {...rest}>
      <Column justifyContent="start" center size={6} overflow="hidden">
        <div className="empty-petsimage" />
      </Column>
      <Column justifyContent="center" size={6} overflow="hidden">
        <div className="bubble-inventory bubble-inventory-bottom-left">
          <Text fontSize={6} overflow="unset" truncate>
            {title}
          </Text>
          <Text overflow="auto" fontSize={6}>
            {" "}
            {desc}
          </Text>
        </div>
        <div className="empty-image" />
		{ !isTrading &&
                    <Flex gap={ 2 } position="absolute" className="bottom-2">
                        <Button className="py-1" onClick={ () => CreateLinkEvent('catalog/open') }>{ LocalizeText('inventory.open.catalog') }</Button>
                    </Flex>
                }
      </Column>
      {children}
    </Grid>
  );
};