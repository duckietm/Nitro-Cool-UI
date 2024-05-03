import { BadgePointLimitsEvent, ILinkEventTracker, IRoomSession, RoomEngineObjectEvent, RoomEngineObjectPlacedEvent, RoomPreviewer, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, GetLocalization, GetRoomEngine, GroupItem, LocalizeText, RemoveLinkEventTracker, isObjectMoverRequested, setObjectMoverRequested } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardTabsItemView, NitroCardTabsView, NitroCardView } from '../../common';
import { useInventoryBadges, useInventoryFurni, useInventoryTrade, useInventoryUnseenTracker, useMessageEvent, useRoomEngineEvent, useRoomSessionManagerEvent } from '../../hooks';
import { TABS, TAB_BADGES, TAB_BOTS, TAB_FURNITURE, TAB_PETS, UNSEEN_CATEGORIES } from './constants';
import { InventoryCategoryFilterView } from './views/InventoryCategoryFilterView';																				  
import { InventoryBadgeView } from './views/badge/InventoryBadgeView';
import { InventoryBotView } from './views/bot/InventoryBotView';
import { InventoryFurnitureView } from './views/furniture/InventoryFurnitureView';
import { InventoryTradeView } from './views/furniture/InventoryTradeView';
import { InventoryPetView } from './views/pet/InventoryPetView';
import { InventoryFurnitureDeleteView } from './views/furniture/InventoryFurnitureDeleteView';


export const InventoryView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ currentTab, setCurrentTab ] = useState<string>(TABS[0]);
    const [ roomSession, setRoomSession ] = useState<IRoomSession>(null);
    const [ roomPreviewer, setRoomPreviewer ] = useState<RoomPreviewer>(null);
	const [ filteredGroupItems, setFilteredGroupItems ] = useState<GroupItem[]>([]);
    const [ filteredBadgeCodes, setFilteredBadgeCodes ] = useState<string[]>([]);
    const { isTrading = false, stopTrading = null } = useInventoryTrade();
    const { getCount = null } = useInventoryUnseenTracker();
    const { groupItems = [] } = useInventoryFurni();
    const { badgeCodes = [] } = useInventoryBadges();

    const onClose = () =>
    {
        if(isTrading) stopTrading();

        setIsVisible(false);
    }

    useRoomEngineEvent<RoomEngineObjectPlacedEvent>(RoomEngineObjectEvent.PLACED, event =>
    {
        if(!isObjectMoverRequested()) return;

        setObjectMoverRequested(false);

        if(!event.placedInRoom) setIsVisible(true);
    });

    useRoomSessionManagerEvent<RoomSessionEvent>([
        RoomSessionEvent.CREATED,
        RoomSessionEvent.ENDED
    ], event =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setRoomSession(event.session);
                return;
            case RoomSessionEvent.ENDED:
                setRoomSession(null);
                setIsVisible(false);
                return;
        }
    });

    useMessageEvent<BadgePointLimitsEvent>(BadgePointLimitsEvent, event =>
    {
        const parser = event.getParser();

        for(const data of parser.data) GetLocalization().setBadgePointLimit(data.badgeId, data.limit);
    });

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;
        
                switch(parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'inventory/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    useEffect(() =>
    {
        setRoomPreviewer(new RoomPreviewer(GetRoomEngine(), ++RoomPreviewer.PREVIEW_COUNTER));

        return () =>
        {
            setRoomPreviewer(prevValue =>
            {
                prevValue.dispose();

                return null;
            });
        }
    }, []);

    useEffect(() =>
    {
        if(!isVisible && isTrading) setIsVisible(true);
    }, [ isVisible, isTrading ]);

    if(!isVisible) return null;

    return (
        <NitroCardView uniqueKey={ 'inventory' } className={ `${ isTrading ? 'nitro-inventory trading no-resize' : 'nitro-inventory' }` } theme={ isTrading ? 'primary' : '' } >
            <NitroCardHeaderView headerText={ LocalizeText('inventory.title') } onCloseClick={ onClose } />
            <>
                <NitroCardTabsView>
                    { TABS.map((name, index) =>
                    {
                        return (
                            <NitroCardTabsItemView key={ index } isActive={ (currentTab === name) } onClick={ event => setCurrentTab(name) } count={ getCount(UNSEEN_CATEGORIES[index]) }>
                                { LocalizeText(name) }
                            </NitroCardTabsItemView>
                        );
                    }) }
                </NitroCardTabsView>
                <NitroCardContentView overflow="hidden">
                    { (currentTab !== TAB_PETS && currentTab !== TAB_BOTS) && <InventoryCategoryFilterView currentTab={ currentTab } groupItems={ groupItems } setGroupItems={ setFilteredGroupItems } badgeCodes={ badgeCodes } setBadgeCodes={ setFilteredBadgeCodes } /> }
                    { (currentTab === TAB_FURNITURE ) &&
                            <InventoryFurnitureView roomSession={ roomSession } roomPreviewer={ roomPreviewer } isTrading={ isTrading } filteredGroupItems={ filteredGroupItems } /> }
                    { (currentTab === TAB_PETS ) &&
                            <InventoryPetView roomSession={ roomSession } roomPreviewer={ roomPreviewer } isTrading={ isTrading } /> }
                    { (currentTab === TAB_BADGES ) &&
                            <InventoryBadgeView filteredBadgeCodes={ filteredBadgeCodes } /> }
                    { (currentTab === TAB_BOTS ) &&
                            <InventoryBotView roomSession={ roomSession } roomPreviewer={ roomPreviewer } isTrading={ isTrading } /> }
							
                    { isTrading && <InventoryTradeView currentTab={ currentTab } setCurrentTab={ (e) => setCurrentTab(e) } cancelTrade={ onClose } /> }
                </NitroCardContentView>
				<InventoryFurnitureDeleteView />
            </>
		</NitroCardView>
		);
}