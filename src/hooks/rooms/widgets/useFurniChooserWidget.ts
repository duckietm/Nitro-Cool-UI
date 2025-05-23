import { RoomObjectCategory, RoomObjectVariable } from '@nitrots/nitro-renderer';
import { useState } from 'react';
import { GetRoomEngine, GetRoomSession, GetSessionDataManager, LocalizeText, RoomObjectItem } from '../../../api';
import { useFurniAddedEvent, useFurniRemovedEvent } from '../engine';
import { useRoom } from '../useRoom';

const useFurniChooserWidgetState = () =>
{
    const [ items, setItems ] = useState<RoomObjectItem[]>(null);
    const { roomSession = null } = useRoom();

    const onClose = () => setItems(null);

    const selectItem = (item: RoomObjectItem) => item && GetRoomEngine().selectRoomObject(GetRoomSession().roomId, item.id, item.category);

    const resolveType = (userType: number): string => {
        switch(userType) {
            case 1: return 'Habbo';
            case 2: return 'Pet';
            case 3: return 'Bot';
            default: return '-';
        }
    }

    const isPetOrBot = (roomObjectType: string): boolean => {
        // Check for pet or bot furniture based on type
        return roomObjectType.includes('pet_') || 
               roomObjectType.includes('bot_') || 
               roomObjectType === 'pet' || 
               roomObjectType === 'bot' || 
               roomObjectType.includes('rentableBot');
    }

    const populateChooser = () =>
    {
        const sessionDataManager = GetSessionDataManager();
        const wallObjects = GetRoomEngine().getRoomObjects(roomSession.roomId, RoomObjectCategory.WALL);
        const floorObjects = GetRoomEngine().getRoomObjects(roomSession.roomId, RoomObjectCategory.FLOOR);

        const wallItems = wallObjects.map(roomObject =>
        {
            if(roomObject.id < 0) return null;

            let name = roomObject.type;

            if(name.startsWith('poster'))
            {
                name = LocalizeText(`poster_${ name.replace('poster', '') }_name`);
            }
            else
            {
                const typeId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_TYPE_ID);
                const furniData = sessionDataManager.getWallItemData(typeId);

                if(furniData && furniData.name.length) name = furniData.name;
            }

            const ownerId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_OWNER_ID) || 0;
            const ownerName = roomObject.model.getValue<string>(RoomObjectVariable.FURNITURE_OWNER_NAME) || 
                             (sessionDataManager.getUserData ? sessionDataManager.getUserData(ownerId)?.name : null) || 
                             `User_${ownerId}`;

            // Skip pet/bot furniture
            if(isPetOrBot(roomObject.type)) {
                return null;
            }

            return new RoomObjectItem(roomObject.id, RoomObjectCategory.WALL, name, ownerId, ownerName, 'furniture');
        }).filter(item => item !== null);

        const floorItems = floorObjects.map(roomObject =>
        {
            if(roomObject.id < 0) return null;

            let name = roomObject.type;

            const typeId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_TYPE_ID);
            const furniData = sessionDataManager.getFloorItemData(typeId);

            if(furniData && furniData.name.length) name = furniData.name;

            const ownerId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_OWNER_ID) || 0;
            const ownerName = roomObject.model.getValue<string>(RoomObjectVariable.FURNITURE_OWNER_NAME) || 
                             (sessionDataManager.getUserData ? sessionDataManager.getUserData(ownerId)?.name : null) || 
                             `User_${ownerId}`;

            // Skip pet/bot furniture
            if(isPetOrBot(roomObject.type)) {
                return null;
            }

            return new RoomObjectItem(roomObject.id, RoomObjectCategory.FLOOR, name, ownerId, ownerName, 'furniture');
        }).filter(item => item !== null);

        setItems([ ...wallItems, ...floorItems ].sort((a, b) => ((a.name < b.name) ? -1 : 1)));
    }

    useFurniAddedEvent(!!items, event =>
    {
        if(event.id < 0) return;

        const roomObject = GetRoomEngine().getRoomObject(GetRoomSession().roomId, event.id, event.category);
        if(!roomObject) return;

        let item: RoomObjectItem = null;

        switch(event.category)
        {
            case RoomObjectCategory.WALL: {
                let name = roomObject.type;

                if(name.startsWith('poster'))
                {
                    name = LocalizeText(`poster_${ name.replace('poster', '') }_name`);
                }
                else
                {
                    const typeId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_TYPE_ID);
                    const furniData = GetSessionDataManager().getWallItemData(typeId);

                    if(furniData && furniData.name.length) name = furniData.name;
                }

                const ownerId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_OWNER_ID) || 0;
                const ownerName = roomObject.model.getValue<string>(RoomObjectVariable.FURNITURE_OWNER_NAME) || 
                                 (GetSessionDataManager().getUserData ? GetSessionDataManager().getUserData(ownerId)?.name : null) || 
                                 `User_${ownerId}`;

                // Skip pet/bot furniture
                if(isPetOrBot(roomObject.type)) {
                    return;
                }

                item = new RoomObjectItem(roomObject.id, RoomObjectCategory.WALL, name, ownerId, ownerName, 'furniture');
                break;
            }
            case RoomObjectCategory.FLOOR: {
                let name = roomObject.type;

                const typeId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_TYPE_ID);
                const furniData = GetSessionDataManager().getFloorItemData(typeId);

                if(furniData && furniData.name.length) name = furniData.name;

                const ownerId = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_OWNER_ID) || 0;
                const ownerName = roomObject.model.getValue<string>(RoomObjectVariable.FURNITURE_OWNER_NAME) || 
                                 (GetSessionDataManager().getUserData ? GetSessionDataManager().getUserData(ownerId)?.name : null) || 
                                 `User_${ownerId}`;

                // Skip pet/bot furniture
                if(isPetOrBot(roomObject.type)) {
                    return;
                }

                item = new RoomObjectItem(roomObject.id, RoomObjectCategory.FLOOR, name, ownerId, ownerName, 'furniture');
                break;
            }
        }

        if(item) setItems(prevValue => [ ...prevValue, item ].sort((a, b) => ((a.name < b.name) ? -1 : 1)));
    });

    useFurniRemovedEvent(!!items, event =>
    {
        if(event.id < 0) return;

        setItems(prevValue =>
        {
            const newValue = [ ...prevValue ];

            for(let i = 0; i < newValue.length; i++)
            {
                const existingValue = newValue[i];

                if((existingValue.id !== event.id) || (existingValue.category !== event.category)) continue;

                newValue.splice(i, 1);
                break;
            }

            return newValue;
        });
    });

    return { items, onClose, selectItem, populateChooser };
}

export const useFurniChooserWidget = useFurniChooserWidgetState;