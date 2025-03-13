import { CreateLinkEvent } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { GetConfigurationValue } from '../../api';
import { Base } from '../../common';

export interface RoomWidgetViewProps {}

export const RoomWidgetView: FC<RoomWidgetViewProps> = props => {
    const poolId = GetConfigurationValue<string>('hotelview')['room.pool'];
    const picnicId = GetConfigurationValue<string>('hotelview')['room.picnic'];
    const rooftopId = GetConfigurationValue<string>('hotelview')['room.rooftop'];
    const rooftopPoolId = GetConfigurationValue<string>('hotelview')['room.rooftop.pool'];
    const peacefulId = GetConfigurationValue<string>('hotelview')['room.peaceful'];
    const infobusId = GetConfigurationValue<string>('hotelview')['room.infobus'];
    const lobbyId = GetConfigurationValue<string>('hotelview')['room.lobby'];

    return (
        <>
            <Base className="nitro-hotel-view-rooftop position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + rooftopId)}>
                <i className="arrow" />
            </Base>
            <Base className="nitro-hotel-view-rooftop-pool position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + rooftopPoolId)}>
                <i className="arrow" />
            </Base>
            <Base className="nitro-hotel-view-picnic position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + picnicId)}>
                <i className="arrow" />
            </Base>
            <Base className="nitro-hotel-view-infobus position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + infobusId)}>
                <i className="arrow-infobus" />
            </Base>
            <Base className="nitro-hotel-view-pool position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + poolId)}>
                <i className="arrow-pool" />
            </Base>
            <Base className="nitro-hotel-view-lobby position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + lobbyId)}>
                <i className="arrow" />
            </Base>
            <Base className="nitro-hotel-view-peaceful position-absolute" onClick={event => CreateLinkEvent('navigator/goto/' + peacefulId)}>
                <i className="arrow-peaceful" />
            </Base>
        </>
    );
};