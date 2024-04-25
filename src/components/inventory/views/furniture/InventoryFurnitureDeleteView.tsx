import { DeleteItemMessageComposer } from '@nitrots/nitro-renderer';
import { FC, useState } from 'react';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { FurnitureItem, LocalizeText, ProductTypeEnum, SendMessageComposer } from '../../../../api';
import { Button, Column, Flex, Grid, LayoutFurniImageView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../../common';
import { DeleteItemConfirmEvent } from '../../../../events';
import { useNotification, useUiEvent } from '../../../../hooks';

export const InventoryFurnitureDeleteView : FC<{}> = props =>
{
    const [ item, setItem ] = useState<FurnitureItem>(null);
    const [ amount, setAmount ] = useState(1);
    const [ tempAmount, setTempAmount ] = useState('1');
    const [ maxAmount, setMaxAmount ] = useState(1);

    const updateAmount = (amnt: string) =>
    {
        let newValue: number = parseInt(amnt);

        if(isNaN(newValue) || (newValue === amount)) return;

        newValue = Math.max(newValue, 1);
        newValue = Math.min(newValue, maxAmount);

        if(newValue === amount) return;

        setTempAmount(newValue.toString());
        setAmount(newValue);
    }

    const { showConfirm = null } = useNotification();

    useUiEvent<DeleteItemConfirmEvent>(DeleteItemConfirmEvent.DELETE_ITEM_CONFIRM, event => {
        setItem(event.item);
        setMaxAmount(event.amount);
    });

    if(!item) return null;

    const getFurniTitle = (item ? LocalizeText(item.isWallItem ? 'wallItem.name.' + item.type : 'roomItem.name.' + item.type) : '');
    const getFurniDescription = (item ? LocalizeText(item.isWallItem ? 'wallItem.desc.' + item.type : 'roomItem.desc.' + item.type) : '');

    const deleteItem = () =>
    {
        if(!item) return;

        showConfirm(LocalizeText('inventory.delete.confirm_delete.info', [ 'furniname', 'amount' ], [ getFurniTitle, amount.toString() ]), () =>
        {
            SendMessageComposer(new DeleteItemMessageComposer(item.id, amount));
            setItem(null);
            setAmount(1);
            setMaxAmount(1);
            setTempAmount('1');
        },
        () => 
        {
            setItem(null);
            setAmount(1);
            setMaxAmount(1);
            setTempAmount('1');
        }, null, null, LocalizeText('inventory.delete.confirm_delete.title'));
    }
    
    return (
        <NitroCardView className="nitro-catalog-layout-marketplace-post-offer" theme="primary-slim">
            <NitroCardHeaderView headerText={ LocalizeText('inventory.delete.confirm_delete.title') } onCloseClick={ event => { setItem(null); setAmount(1); setMaxAmount(1); setTempAmount('1'); } } />
            <NitroCardContentView overflow="hidden">
                <Grid fullHeight>
                    <Column center className="bg-muted rounded p-2" size={ 4 } overflow="hidden">
                        <LayoutFurniImageView productType={ item.isWallItem ? ProductTypeEnum.WALL : ProductTypeEnum.FLOOR } productClassId={ item.type } extraData={ item.extra.toString() } />
                    </Column>
                    <Column size={ 8 } justifyContent="between" overflow="hidden">
                        <Column grow gap={ 1 }>
                            <Text fontWeight="bold">{ getFurniTitle }</Text>
                            <Text truncate shrink>{ getFurniDescription }</Text>
                        </Column>
                        <Column overflow="auto">
                            <Text>{ LocalizeText('inventory.delete.amount') }</Text>
                            <Flex alignItems="center" gap={ 1 }>
                                <FaCaretLeft className="text-black cursor-pointer fa-icon" onClick={ event => updateAmount((amount - 1).toString()) } />
                                <input className="form-control form-control-sm quantity-input" type="number" min={ 1 } max={ maxAmount } value={ tempAmount } onChange={ event => updateAmount(event.target.value) } placeholder={ LocalizeText('inventory.delete.amount') } />
                                <FaCaretRight className="text-black cursor-pointer fa-icon" onClick={ event => updateAmount((amount + 1).toString()) } />
                                <Button onClick={ event => updateAmount(maxAmount.toString()) }>
                                    { LocalizeText('inventory.delete.max_amount.button') }
                                </Button>
                            </Flex>
                            <Button disabled={ (amount > maxAmount) } onClick={ deleteItem }>
                                { LocalizeText('inventory.delete.confirm_delete.button') }
                            </Button>
                        </Column>
                    </Column>
                </Grid>
            </NitroCardContentView>
        </NitroCardView>
    )
}