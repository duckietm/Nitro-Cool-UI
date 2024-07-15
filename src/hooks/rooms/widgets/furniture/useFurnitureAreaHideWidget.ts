import { GetRoomEngine, RoomAreaSelectionManager, RoomEngineAreaHideStateEvent, RoomEngineTriggerWidgetEvent, RoomObjectVariable } from '@nitrots/nitro-renderer';
import { useEffect, useState } from 'react';
import { CanManipulateFurniture } from '../../../../api';
import { useNitroEvent } from '../../../events';
import { useRoom } from '../../useRoom';

const useFurnitureAreaHideWidgetState = () =>
{
    const [ objectId, setObjectId ] = useState<number>(-1);
    const [ category, setCategory ] = useState<number>(-1);
    const [ isOn, setIsOn ] = useState<boolean>(false);
    const [ rootX, setRootX ] = useState<number>(0);
    const [ rootY, setRootY ] = useState<number>(0);
    const [ width, setWidth ] = useState<number>(0);
    const [ length, setLength ] = useState<number>(0);
    const [ invisibility, setInvisibility ] = useState<boolean>(false);
    const [ wallItems, setWallItems ] = useState<boolean>(false);
    const [ inverted, setInverted ] = useState<boolean>(false);
    const { roomSession = null } = useRoom();

    const onClose = () =>
    {
        setObjectId(-1);
        setCategory(-1);
        setIsOn(false);
        setRootX(0);
        setRootY(0);
        setWidth(0);
        setLength(0);
        setInvisibility(false);
        setWallItems(false);
        setInverted(false);

        GetRoomEngine().areaSelectionManager.deactivate();
    };

    useNitroEvent<RoomEngineTriggerWidgetEvent>(RoomEngineTriggerWidgetEvent.REQUEST_AREA_HIDE, event =>
    {
        if(!CanManipulateFurniture(roomSession, event.objectId, event.category)) return;

        setObjectId(event.objectId);
        setCategory(event.category);

        const roomObject = GetRoomEngine().getRoomObject(event.roomId, event.objectId, event.category);

        const model = roomObject.model;

        setIsOn(roomObject.getState(0) === 1);
        setRootX(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_ROOT_X) ?? 0);
        setRootY(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_ROOT_Y) ?? 0);
        setWidth(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_WIDTH) ?? 0);
        setLength(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_LENGTH) ?? 0);
        setInvisibility(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_INVISIBILITY) === 1);
        setWallItems(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_WALL_ITEMS) === 1);
        setInverted(model.getValue<number>(RoomObjectVariable.FURNITURE_AREA_HIDE_INVERT) === 1);
    });

    useNitroEvent<RoomEngineAreaHideStateEvent>(RoomEngineAreaHideStateEvent.UPDATE_STATE_AREA_HIDE, event =>
    {
        setObjectId(event.objectId);
        setCategory(event.category);
        setIsOn(event.isOn);
    });

    useEffect(() =>
    {
        if(objectId === -1) return;

        if(!isOn)
        {
            const callback = (rootX: number, rootY: number, width: number, height: number) =>
            {
                setRootX(rootX);
                setRootY(rootY);
                setWidth(width);
                setLength(height);
            };

            if(GetRoomEngine().areaSelectionManager.activate(callback, RoomAreaSelectionManager.HIGHLIGHT_DARKEN))
            {
                GetRoomEngine().areaSelectionManager.setHighlight(rootX, rootY, width, length);
            }
        }
        else
        {
            GetRoomEngine().areaSelectionManager.deactivate();
        }
    }, [ objectId, isOn, rootX, rootY, width, length ]);

    return { objectId, category, isOn, setIsOn, rootX, setRootX, rootY, setRootY, width, setWidth, length, setLength, invisibility, setInvisibility, wallItems, setWallItems, inverted, setInverted, onClose };
};

export const useFurnitureAreaHideWidget = useFurnitureAreaHideWidgetState;