import { GetConfiguration, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useState } from 'react';
import { GetConfigurationValue } from '../../api';
import { HotelMorning } from './views/widgets/hoteldayview/HotelMorning';
import { HotelDay } from './views/widgets/hoteldayview/HotelDay';
import { HotelSunset } from './views/widgets/hoteldayview/HotelSunset';
import { HotelEvening } from './views/widgets/hoteldayview/HotelEvening';
import { HotelNight } from './views/widgets/hoteldayview/HotelNight';
import { LayoutAvatarImageView } from '../../common';
import { RoomWidgetView } from './views/widgets/rooms/RoomWidgetView';
import { useNitroEvent, useSessionInfo } from '../../hooks';
import { WidgetView } from './WidgetView';

const widgetSlotCount = 7;

export const HotelView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(true);
    const { userFigure = null } = useSessionInfo();
	
	const now = new Date();
    const currentHour = now.getHours();
    const isMorning = currentHour > 5 && currentHour <= 9;
	const isDay = currentHour > 9 && currentHour <= 16;
	const isSunset = currentHour > 16 && currentHour <= 19;
    const isEvening = currentHour > 19 && currentHour <= 23;
    const isNight = currentHour > 23 || currentHour <= 5;

    useNitroEvent<RoomSessionEvent>([
        RoomSessionEvent.CREATED,
        RoomSessionEvent.ENDED ], event =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setIsVisible(false);
                return;
            case RoomSessionEvent.ENDED:
                setIsVisible(event.openLandingView);
                return;
        }
    });

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
}
