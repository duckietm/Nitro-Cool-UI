import { CreateLinkEvent } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { GetConfigurationValue } from '../../../../../api';
import { Base, Flex } from '../../../../../common';


export interface RoomWidgetViewProps
{
}

export const RoomWidgetView: FC<RoomWidgetViewProps> = props =>
{
    const poolId = GetConfigurationValue<string>('hotelview')['room.pool'];
    const picnicId = GetConfigurationValue<string>('hotelview')['room.picnic'];
    const rooftopId = GetConfigurationValue<string>('hotelview')['room.rooftop'];
    const rooftopPoolId = GetConfigurationValue<string>('hotelview')['room.rooftop.pool'];
    const peacefulId = GetConfigurationValue<string>('hotelview')['room.peaceful'];
    const infobusId = GetConfigurationValue<string>('hotelview')['room.infobus'];
    const lobbyId = GetConfigurationValue<string>('hotelview')['room.lobby'];



    return (
        <Flex>
            <Base className="rooftop position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + rooftopId) }>
                <i className="active-arrow arrow"/>
            </Base>
            <Base className="rooftop-pool position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + rooftopPoolId) }>
                <i className="active-arrow arrow"/>
            </Base>
            <Base className="pool position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + poolId) }>
                <i className="active-arrow arrow"/>
            </Base>
            <Base className="picnic position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + picnicId) }>
                <i className="active-arrow arrow"/>
            </Base>
            <Base className="peaceful position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + peacefulId) }>
                <i className="active-arrow arrow"/>
            </Base>
            <Base className="infobus position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + infobusId) }>
                <i className="active-arrow arrow"/>
            </Base>
            <Base className="lobby position-absolute" onClick={ event => CreateLinkEvent('navigator/goto/' + lobbyId) }>
                <i className="active-arrow arrow"/>
            </Base>
        </Flex>

    );
}
