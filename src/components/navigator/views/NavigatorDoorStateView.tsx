import { FC, useEffect, useState } from 'react';
import { CreateRoomSession, DoorStateType, GoToDesktop, LocalizeText } from '../../../api';
import { Button, Column, Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../common';
import { useNavigator } from '../../../hooks';

const VISIBLE_STATES = [ DoorStateType.START_DOORBELL, DoorStateType.STATE_WAITING, DoorStateType.STATE_NO_ANSWER, DoorStateType.START_PASSWORD, DoorStateType.STATE_WRONG_PASSWORD ];
const DOORBELL_STATES = [ DoorStateType.START_DOORBELL, DoorStateType.STATE_WAITING, DoorStateType.STATE_NO_ANSWER ];
const PASSWORD_STATES = [ DoorStateType.START_PASSWORD, DoorStateType.STATE_WRONG_PASSWORD ];

export const NavigatorDoorStateView: FC<{}> = props =>
{
    const [ password, setPassword ] = useState('');
    const { doorData = null, setDoorData = null } = useNavigator();

    const onClose = () =>
    {
        if(doorData && (doorData.state === DoorStateType.STATE_WAITING)) GoToDesktop();

        setDoorData(null);
    }

    const ring = () =>
    {
        if(!doorData || !doorData.roomInfo) return;

        CreateRoomSession(doorData.roomInfo.roomId);
        
        setDoorData(prevValue =>
        {
            const newValue = { ...prevValue };

            newValue.state = DoorStateType.STATE_PENDING_SERVER;

            return newValue;
        });
    }

    const tryEntering = () =>
    {
        if(!doorData || !doorData.roomInfo) return;

        CreateRoomSession(doorData.roomInfo.roomId, password);

        setDoorData(prevValue =>
        {
            const newValue = { ...prevValue };

            newValue.state = DoorStateType.STATE_PENDING_SERVER;

            return newValue;
        });
    }

    useEffect(() =>
    {
        if(!doorData || (doorData.state !== DoorStateType.STATE_NO_ANSWER)) return;

        GoToDesktop();
    }, [ doorData ]);

    if(!doorData || (doorData.state === DoorStateType.NONE) || (VISIBLE_STATES.indexOf(doorData.state) === -1)) return null;

    const isDoorbell = (DOORBELL_STATES.indexOf(doorData.state) >= 0);

    return (
        <NitroCardView className="nitro-navigator-doorbell" theme="primary">
            <NitroCardHeaderView headerText={ LocalizeText(isDoorbell ? 'navigator.doorbell.title' : 'navigator.password.title') } onCloseClick={ onClose } />
            <NitroCardContentView className="px-3 pb-4">
                <Column gap={ 1 }>
                    <Text small bold>{ doorData && doorData.roomInfo && doorData.roomInfo.roomName }</Text>
                    { (doorData.state === DoorStateType.START_DOORBELL) &&
                        <Text small>{ LocalizeText('navigator.doorbell.info') }</Text> }
                    { (doorData.state === DoorStateType.STATE_WAITING) &&
                        <Text small>{ LocalizeText('navigator.doorbell.waiting') }</Text> }
                    { (doorData.state === DoorStateType.STATE_NO_ANSWER) &&
                        <Text small>{ LocalizeText('navigator.doorbell.no.answer') }</Text> }
                    { (doorData.state === DoorStateType.START_PASSWORD) &&
                        <Text small>{ LocalizeText('navigator.password.info') }</Text> }
                    { (doorData.state === DoorStateType.STATE_WRONG_PASSWORD) &&
                        <Text small>{ LocalizeText('navigator.password.retryinfo') }</Text> }
                </Column>
                { isDoorbell &&
                    <Flex fullWidth gap={ 1 } className="align-items-end mt-auto pt-3">
                        <Text small className="cursor-pointer" underline onClick={ onClose }>
                            { LocalizeText('generic.cancel') }
                        </Text>
                        { (doorData.state === DoorStateType.START_DOORBELL) &&
                            <Button className="ms-auto" onClick={ ring }>
                                { LocalizeText('navigator.doorbell.button.ring') }
                            </Button> }
                    </Flex> }
                { !isDoorbell &&
                    <>
                        <Flex className="pt-3 align-items-center" gap={ 1 }>
                            <Text small fullWidth>{ LocalizeText('navigator.password.enter') }</Text>
                            <input type="password" className="form-control form-control-sm" onChange={ event => setPassword(event.target.value) } />
                        </Flex>
                        <Flex fullWidth gap={ 1 } className="align-items-end mt-auto pt-3">
                            <Text small className="cursor-pointer" underline onClick={ onClose }>
                                { LocalizeText('generic.cancel') }
                            </Text>
                            <Button className="ms-auto" onClick={ tryEntering }>
                                { LocalizeText('navigator.password.button.try') }
                            </Button>
                        </Flex>
                    </> }
            </NitroCardContentView>
        </NitroCardView>
    );
}
