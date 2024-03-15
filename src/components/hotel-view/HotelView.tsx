import { NitroConfiguration, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useState, useCallback } from 'react';
import { GetConfiguration, GetConfigurationManager } from '../../api';
import { LayoutAvatarImageView } from '../../common';
import { useRoomSessionManagerEvent, useSessionInfo } from '../../hooks';
import { HotelDay } from './views/widgets/hoteldayview/HotelDay';
import { HotelEvening } from './views/widgets/hoteldayview/HotelEvening';
import { HotelMorning } from './views/widgets/hoteldayview/HotelMorning';
import { HotelNight } from './views/widgets/hoteldayview/HotelNight';
import { HotelSunset } from './views/widgets/hoteldayview/HotelSunset';
import { WidgetView } from './WidgetView';

const widgetSlotCount = 7;

export const HotelView: FC<{}> = () => {
    const [isVisible, setIsVisible] = useState(true);
    const { userFigure = null } = useSessionInfo();

    const now = new Date();
    const currentHour = now.getHours();
    const isMorning = currentHour > 5 && currentHour <= 9;
	const isDay = currentHour > 9 && currentHour <= 16;
	const isSunset = currentHour > 16 && currentHour <= 19;
    const isEvening = currentHour > 19 && currentHour <= 23;
    const isNight = currentHour > 23 || currentHour <= 5;

    useRoomSessionManagerEvent<RoomSessionEvent>(
        [RoomSessionEvent.CREATED, RoomSessionEvent.ENDED],
        event => {
            setIsVisible(
                event.type === RoomSessionEvent.CREATED ? false : event.openLandingView
            );
        }
    );

    if (!isVisible) return null;

    return (
        <div>
            <WidgetView />
            {isMorning && <HotelMorning />}
			{isDay && <HotelDay />}
			{isSunset && <HotelSunset />}
            {isEvening && <HotelEvening />}
            {isNight && <HotelNight />}
        </div>
    );
};