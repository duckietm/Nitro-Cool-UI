import { IRoomSession, RoomObjectVariable, RoomPreviewer, Vector3d } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { attemptItemPlacement, DispatchUiEvent, FurniCategory, GetRoomEngine, GetSessionDataManager, GroupItem, LocalizeText, UnseenItemCategory } from '../../../../api';
import { AutoGrid, Button, Column, Grid, LayoutLimitedEditionCompactPlateView, LayoutRarityLevelView, LayoutRoomPreviewerView, Text } from '../../../../common';
import { CatalogPostMarketplaceOfferEvent } from '../../../../events';
import { DeleteItemConfirmEvent } from '../../../../events';
import { FaTrashAlt } from 'react-icons/fa';
import { useInventoryFurni, useInventoryUnseenTracker } from '../../../../hooks';
import { InventoryCategoryEmptyView } from '../InventoryCategoryEmptyView';
import { InventoryFurnitureItemView } from './InventoryFurnitureItemView';
import { InventoryFurnitureSearchView } from './InventoryFurnitureSearchView';

interface InventoryFurnitureViewProps
{
    roomSession: IRoomSession;
    roomPreviewer: RoomPreviewer;
}

const FILTER_TYPE_EVERYTHING = 'inventory.filter.option.everything';
const FILTER_TYPE_FLOOR = 'inventory.furni.tab.floor';
const FILTER_TYPE_WALL = 'inventory.furni.tab.wall';
const FILTER_TYPE_WIRED = 'inventory.furni.tab.wired';

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
    const { roomSession = null, roomPreviewer = null } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const [ filteredGroupItems, setFilteredGroupItems ] = useState<GroupItem[]>([]);
    const { groupItems = [], selectedItem = null, activate = null, deactivate = null } = useInventoryFurni();
    const { resetItems = null } = useInventoryUnseenTracker();
	const [ filterType = string, setFilterType ] = useState(FILTER_TYPE_EVERYTHING);
	
	useEffect(() => 
    {
        const filteredItems = groupItems.filter(item => 
        {
            const isWallItem = item.isWallItem;
            const isFloorItem = !isWallItem;
            const isWiredItem = item.name.startsWith('WIRED');

            switch (filterType) 
            {
                case FILTER_TYPE_WALL:
                    return isWallItem;
                case FILTER_TYPE_FLOOR:
                    return isFloorItem;
                case FILTER_TYPE_WIRED:
                    return isWiredItem;
                case FILTER_TYPE_EVERYTHING:
                default:
                    return true;
            }
        });

        setFilteredGroupItems(filteredItems);
    }, [ groupItems, filterType ]);

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

    if(!groupItems || !groupItems.length) return <InventoryCategoryEmptyView title={ LocalizeText('inventory.empty.title') } desc={ LocalizeText('inventory.empty.desc') } />;

    return (
        <Grid>
            <Column size={ 7 } overflow="hidden">
                <InventoryFurnitureSearchView groupItems={ groupItems } setGroupItems={ setFilteredGroupItems } />
                <select className="form-select form-select-sm" value={ filterType } onChange={ e => setFilterType(e.target.value) }>
                    { [ FILTER_TYPE_EVERYTHING, FILTER_TYPE_FLOOR, FILTER_TYPE_WALL, FILTER_TYPE_WIRED ].map(type => (
                        <option key={ type } value={ type }>{ LocalizeText(type) }</option>
                    )) }
                </select>
                <AutoGrid columnCount={ 5 }>
                    { filteredGroupItems && (filteredGroupItems.length > 0) && filteredGroupItems.map((item, index) => <InventoryFurnitureItemView key={ index } groupItem={ item } />) }
                </AutoGrid>
            </Column>
            <Column size={ 5 } overflow="auto">
                <Column overflow="hidden" position="relative">
                    <LayoutRoomPreviewerView roomPreviewer={ roomPreviewer } height={ 140 } />
					{ selectedItem &&
						<Button variant="danger" className="bottom-2 end-2" position="absolute" onClick={ event => attemptDeleteItem(selectedItem) }>
							<FaTrashAlt className="fa-icon" />
						</Button> 
					}
                    { selectedItem && selectedItem.stuffData.isUnique &&
                        <LayoutLimitedEditionCompactPlateView className="top-2 end-2" position="absolute" uniqueNumber={ selectedItem.stuffData.uniqueNumber } uniqueSeries={ selectedItem.stuffData.uniqueSeries } /> }
                    { (selectedItem && selectedItem.stuffData.rarityLevel > -1) &&
                        <LayoutRarityLevelView className="top-2 end-2" position="absolute" level={ selectedItem.stuffData.rarityLevel } /> }
                </Column>
                { selectedItem &&
                    <Column grow justifyContent="between" gap={ 2 }>
                        <Text grow>{ selectedItem.name }</Text>
                        <Column gap={ 1 }>
                            { !!roomSession &&
                                <Button variant="success" onClick={ event => attemptItemPlacement(selectedItem) }>
                                    { LocalizeText('inventory.furni.placetoroom') }
                                </Button> }
                            { (selectedItem && selectedItem.isSellable) &&
                                <Button onClick={ event => attemptPlaceMarketplaceOffer(selectedItem) }>
                                    { LocalizeText('inventory.marketplace.sell') }
                                </Button> }
                        </Column>
                    </Column> }
            </Column>
        </Grid>
    );
}
