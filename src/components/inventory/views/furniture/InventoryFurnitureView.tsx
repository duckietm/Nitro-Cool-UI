import { DeleteFurniTypeInventoryComposer, IObjectData, IRoomSession, RoomObjectVariable, RoomPreviewer, TradingListAddItemComposer, TradingListAddItemsComposer, Vector3d } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { DispatchUiEvent, FurniCategory, GetRoomEngine, GetSessionDataManager, GroupItem, IFurnitureItem, LocalizeText, NotificationAlertType, SendMessageComposer, UnseenItemCategory, attemptItemPlacement, getGuildFurniType } from '../../../../api';
import { AutoGrid, Base, Button, Column, Flex, Grid, LayoutLimitedEditionCompactPlateView, LayoutRarityLevelView, LayoutRoomPreviewerView, Text } from '../../../../common';
import { CatalogPostMarketplaceOfferEvent, DeleteItemConfirmEvent } from '../../../../events';
import { FaTrashAlt } from 'react-icons/fa';
import { useInventoryFurni, useInventoryTrade, useInventoryUnseenTracker, useNotification } from '../../../../hooks';
import { MAX_ITEMS_TO_TRADE } from '../../constants';
import { InventoryCategoryEmptyView } from '../InventoryCategoryEmptyView';
import { InventoryFurnitureItemView } from './InventoryFurnitureItemView';

interface InventoryFurnitureViewProps
{
    roomSession: IRoomSession;
    roomPreviewer: RoomPreviewer;
    isTrading: boolean;
    filteredGroupItems: GroupItem[];
}

const attemptPlaceMarketplaceOffer = (groupItem: GroupItem) =>
{
    const item = groupItem.getLastItem();

    if(!item) return false;

    if(!item.sellable) return false;

    DispatchUiEvent(new CatalogPostMarketplaceOfferEvent(item));
}

const attemptDeleteItem = (groupItem: GroupItem) =>
{
    const item = groupItem.getLastItem();

    if(!item) return false;

    DispatchUiEvent(new DeleteItemConfirmEvent(item, groupItem.getTotalCount()));
}

export const InventoryFurnitureView: FC<InventoryFurnitureViewProps> = props =>
{
    const { roomSession = null, roomPreviewer = null, isTrading = null, filteredGroupItems = [] } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const [ groupItem, setGroupItem ] = useState<GroupItem>(null);
    const [ quantity, setQuantity ] = useState<number>(1);
    const { groupItems = [], selectedItem = null, activate = null, deactivate = null } = useInventoryFurni();
    const { ownUser = null } = useInventoryTrade();
    const { resetItems = null } = useInventoryUnseenTracker();
    const { simpleAlert = null } = useNotification();

    const updateQuantity = (value: number, totalItemCount: number) =>
    {
        if(isNaN(Number(value)) || Number(value) < 0 || !value) value = 1;

        value = Math.max(Number(value), 1);
        value = Math.min(Number(value), totalItemCount);

        if(value === quantity) return;

        setQuantity(value);
    }

    const changeCount = (totalItemCount: number) =>
    {
        updateQuantity(quantity, totalItemCount);
        attemptItemOffer(quantity);
    }

    const canTradeItem = (isWallItem: boolean, spriteId: number, category: number, groupable: boolean, stuffData: IObjectData) =>
    {
        if(!ownUser || ownUser.accepts || !ownUser.userItems) return false;

        if(ownUser.userItems.length < MAX_ITEMS_TO_TRADE) return true;

        if(!groupable) return false;

        let type = spriteId.toString();

        if(category === FurniCategory.POSTER)
        {
            type = ((type + 'poster') + stuffData.getLegacyString());
        }
        else
        {
            if(category === FurniCategory.GUILD_FURNI)
            {
                type = getGuildFurniType(spriteId, stuffData);
            }
            else
            {
                type = (((isWallItem) ? 'I' : 'S') + type);
            }
        }

        return !!ownUser.userItems.getValue(type);
    }

    const attemptItemOffer = (count: number) =>
    {
        if(!groupItem) return;

        const tradeItems = groupItem.getTradeItems(count);

        if(!tradeItems || !tradeItems.length) return;

        let coreItem: IFurnitureItem = null;
        const itemIds: number[] = [];

        for(const item of tradeItems)
        {
            itemIds.push(item.id);

            if(!coreItem) coreItem = item;
        }

        const ownItemCount = ownUser.userItems.length;

        if((ownItemCount + itemIds.length) <= 1500)
        {
            if(!coreItem.isGroupable && (itemIds.length))
            {
                SendMessageComposer(new TradingListAddItemComposer(itemIds.pop()));
            }
            else
            {
                const tradeIds: number[] = [];

                for(const itemId of itemIds)
                {
                    if(canTradeItem(coreItem.isWallItem, coreItem.type, coreItem.category, coreItem.isGroupable, coreItem.stuffData))
                    {
                        tradeIds.push(itemId);
                    }
                }

                if(tradeIds.length)
                {
                    if(tradeIds.length === 1)
                    {
                        SendMessageComposer(new TradingListAddItemComposer(tradeIds.pop()));
                    }
                    else
                    {
                        SendMessageComposer(new TradingListAddItemsComposer(...tradeIds));
                    }
                }
            }
        }
        else
        {
            simpleAlert(LocalizeText('trading.items.too_many_items.desc'), NotificationAlertType.DEFAULT, null, null, LocalizeText('trading.items.too_many_items.title'));
        }

        setGroupItem(selectedItem);
    }

    useEffect(() =>
    {
        if(!selectedItem || !roomPreviewer) return;

        const furnitureItem = selectedItem.getLastItem();

        if(!furnitureItem) return;

        const roomEngine = GetRoomEngine();

        let wallType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_WALL_TYPE);
        let floorType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_FLOOR_TYPE);
        let landscapeType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_LANDSCAPE_TYPE);

        wallType = (wallType && wallType.length) ? wallType : '101';
        floorType = (floorType && floorType.length) ? floorType : '101';
        landscapeType = (landscapeType && landscapeType.length) ? landscapeType : '1.1';

        roomPreviewer.reset(false);
        roomPreviewer.updateObjectRoom(floorType, wallType, landscapeType);
        roomPreviewer.updateRoomWallsAndFloorVisibility(true, true);

        if((furnitureItem.category === FurniCategory.WALL_PAPER) || (furnitureItem.category === FurniCategory.FLOOR) || (furnitureItem.category === FurniCategory.LANDSCAPE))
        {
            floorType = ((furnitureItem.category === FurniCategory.FLOOR) ? selectedItem.stuffData.getLegacyString() : floorType);
            wallType = ((furnitureItem.category === FurniCategory.WALL_PAPER) ? selectedItem.stuffData.getLegacyString() : wallType);
            landscapeType = ((furnitureItem.category === FurniCategory.LANDSCAPE) ? selectedItem.stuffData.getLegacyString() : landscapeType);

            roomPreviewer.updateObjectRoom(floorType, wallType, landscapeType);

            if(furnitureItem.category === FurniCategory.LANDSCAPE)
            {
                const data = GetSessionDataManager().getWallItemDataByName('window_double_default');

                if(data) roomPreviewer.addWallItemIntoRoom(data.id, new Vector3d(90, 0, 0), data.customParams);
            }
        }
        else
        {
            if(selectedItem.isWallItem)
            {
                roomPreviewer.addWallItemIntoRoom(selectedItem.type, new Vector3d(90), furnitureItem.stuffData.getLegacyString());
            }
            else
            {
                roomPreviewer.addFurnitureIntoRoom(selectedItem.type, new Vector3d(90), selectedItem.stuffData, (furnitureItem.extra.toString()));
            }
        }

        setGroupItem(selectedItem);
    }, [ roomPreviewer, selectedItem ]);

    useEffect(() =>
    {
        if(!selectedItem || !selectedItem.hasUnseenItems) return;

        resetItems(UnseenItemCategory.FURNI, selectedItem.items.map(item => item.id));

        selectedItem.hasUnseenItems = false;
    }, [ selectedItem, resetItems ]);

    useEffect(() =>
    {
        if(!isVisible) return;

        const id = activate();

        return () => deactivate(id);
    }, [ isVisible, activate, deactivate ]);

    useEffect(() =>
    {
        setIsVisible(true);

        return () => setIsVisible(false);
    }, []);

    useEffect(() =>
    {
        setQuantity(1);
    }, [ filteredGroupItems ]);
	
    if(!groupItems || !groupItems.length) return <InventoryCategoryEmptyView title={ LocalizeText('inventory.empty.title') } desc={ LocalizeText('inventory.empty.desc') } isTrading={ isTrading } />;
    
    const totalItems = !isTrading ? selectedItem.items.length : selectedItem.getUnlockedCount();
    
    return (
        <Grid className="mt-n1">
            <Column size={ 7 } overflow="hidden" style={ { height: `calc(100% - ${ !isTrading ? '34px' : '5px' })` } }>
                <AutoGrid gap={ 1 } columnCount={ 5 } className={ isTrading ? 'trading-inventory' : '' }>
                    { filteredGroupItems && (filteredGroupItems.length > 0) && filteredGroupItems.map((item, index) => <InventoryFurnitureItemView key={ index } groupItem={ item } isTrading={ isTrading } attemptItemOffer={ (e) => attemptItemOffer(e) } setGroupItem={ (e) => setGroupItem(e) } />) }
                </AutoGrid>
            </Column>
            <Column size={ 5 } overflow="auto">
                <Column overflow="hidden" position="relative" className="cursor-pointer">
                    <LayoutRoomPreviewerView roomPreviewer={ roomPreviewer } height={ 140 } />
					{ selectedItem &&
                                <Button variant="danger" className="bottom-2 end-2" position="absolute" onClick={ event => attemptDeleteItem(selectedItem) }>
                                    <FaTrashAlt className="fa-icon" />
                                </Button> 
					}
                    { (selectedItem && (selectedItem.items[0].isTradable || !selectedItem.items[0].isTradable)) &&
                        <Flex gap={ 2 } position="absolute" className="top-2 start-2">
                            <Base className={ `icon ${ (selectedItem.items[0].isTradable && totalItems > 0) ? 'icon-tradeable' : 'icon-not-tradeable' }` } title={ LocalizeText((selectedItem.items[0].isTradable && totalItems > 0) ? 'inventory.furni.preview.tradeable_amount' : 'inventory.furni.preview.not_tradeable') } />
                            { (selectedItem.items[0].isTradable && totalItems > 0) && <Text variant="black" className="text-shadow-around-text mt-n1">{ totalItems }</Text> }
                        </Flex>
                    }
                    { (selectedItem && (selectedItem.items[0].recyclable || !selectedItem.items[0].recyclable)) &&
                        <Flex gap={ 2 } position="absolute" className="top-4 start-2">
                            <Base className={ `icon ${ (selectedItem.items[0].recyclable && totalItems > 0) ? 'icon-recyclable' : 'icon-not-recyclable' }` } title={ LocalizeText((selectedItem.items[0].recyclable && totalItems > 0) ? 'inventory.furni.preview.recyclable_amount' : 'inventory.furni.preview.not_recyclable') } />
                            { (selectedItem.items[0].recyclable && totalItems > 0) && <Text variant="black" className="text-shadow-around-text">{ totalItems }</Text> }
                        </Flex>
                    }
                    { selectedItem && selectedItem.stuffData.isUnique &&
                        <LayoutLimitedEditionCompactPlateView className="top-2 end-2" position="absolute" uniqueNumber={ selectedItem.stuffData.uniqueNumber } uniqueSeries={ selectedItem.stuffData.uniqueSeries } /> }
                    { (selectedItem && selectedItem.stuffData.rarityLevel > -1) &&
                        <LayoutRarityLevelView className="top-2 end-2" position="absolute" level={ selectedItem.stuffData.rarityLevel } /> }
					
                </Column>
                { selectedItem &&
                    <Column grow justifyContent="between" gap={ 2 }>
                        <Column gap={ 1 } position={ !isTrading ? 'absolute' : 'relative' } className="bottom-1" style={ { width: !isTrading ? '39%' : '' } }>
                            <Text grow truncate bold>{ selectedItem.name }</Text>
                            { (selectedItem.description) && <Text grow truncate small>{ selectedItem.description }</Text> }
                            { (!isTrading) &&
                                <>
                                    { !!roomSession &&
                                        <Button className="p-0 px-2" onClick={ event => attemptItemPlacement(selectedItem) }>
                                            { LocalizeText('inventory.furni.placetoroom') }
                                        </Button> }
                                    { (selectedItem && selectedItem.isSellable) &&
                                        <Button className="p-0 px-2" onClick={ event => attemptPlaceMarketplaceOffer(selectedItem) }>
                                            { LocalizeText('inventory.marketplace.sell') }
                                        </Button> }
                                </>
                            }
                            { (isTrading) &&
                                <Column gap={ 1 } alignItems="start">
                                    <input type="number" className="quantity-input remove-outline form-control" placeholder={ LocalizeText('catalog.bundlewidget.spinner.select.amount') } disabled={ selectedItem.getUnlockedCount() === 0 } value={ !quantity ? '' : quantity } onChange={ event => setQuantity(event.target.valueAsNumber) } />
                                    <Button variant="secondary" disabled={ !quantity || selectedItem.getUnlockedCount() === 0 } onClick={ event => !quantity ? null : changeCount(selectedItem.getUnlockedCount()) }>{ LocalizeText('inventory.trading.areoffering') }</Button>
                                </Column>
                            }
							
							
                        </Column>
                    </Column> }
            </Column>
        </Grid>
    );
}
