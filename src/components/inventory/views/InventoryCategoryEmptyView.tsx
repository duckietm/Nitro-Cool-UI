import { FC } from 'react';
import { CreateLinkEvent, LocalizeText } from '../../../api';
import { Button, Column, Flex, Grid, GridProps, Text } from '../../../common';

export interface InventoryCategoryEmptyViewProps extends GridProps
{
    title: string;
    desc: string;
	isTrading?: boolean;
}

export const InventoryCategoryEmptyView: FC<InventoryCategoryEmptyViewProps> = props =>
{
    const { title = '', desc = '', isTrading = false, children = null, ...rest } = props;
    
    return (
    <Grid {...rest}>
      <Column center size={ 5 } overflow="hidden">
        <div className="empty-image" />
		{ !isTrading &&
                    <Flex gap={ 2 } position="absolute" className="bottom-2">
                        <Button className="py-1" onClick={ () => CreateLinkEvent('catalog/open') }>{ LocalizeText('inventory.open.catalog') }</Button>
                    </Flex>
                }
      </Column>
	  <Column justifyContent="center" size={ 7 } overflow="hidden">
                <Text fontWeight="bold" fontSize={ 5 } overflow="unset" truncate>{ title }</Text>
                <Text overflow="auto">{ desc }</Text>
            </Column>
      {children}
    </Grid>
  );
};