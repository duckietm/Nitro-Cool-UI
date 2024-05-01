/* eslint-disable no-template-curly-in-string */
import { CreateFlatMessageComposer, HabboClubLevelEnum } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { CreateLinkEvent, GetClubMemberLevel, GetConfiguration, IRoomModel, LocalizeText, SendMessageComposer } from '../../../api';
import { AutoGrid, Base, Button, Column, Flex, Grid, LayoutInputErrorView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../common';
import { RoomCreatorGridItem } from '../../../common/layout/RoomCreatorGridItem';
import { useNavigator } from '../../../hooks';

export const NavigatorRoomCreatorView: FC<{}> = props =>
{
    const [ maxVisitorsList, setMaxVisitorsList ] = useState<number[]>(null);
    const [ name, setName ] = useState<string>(null);
    const [ description, setDescription ] = useState<string>(null);
    const [ category, setCategory ] = useState<number>(null);
    const [ visitorsCount, setVisitorsCount ] = useState<number>(null);
    const [ tradesSetting, setTradesSetting ] = useState<number>(0);
    const [ roomModels, setRoomModels ] = useState<IRoomModel[]>([]);
    const [ selectedModelName, setSelectedModelName ] = useState<string>('');
    const { categories = null } = useNavigator();

    const hcDisabled = GetConfiguration<boolean>('hc.disabled', false);

    const getRoomModelImage = (name: string) => GetConfiguration<string>('images.url') + `/navigator/models/model_${ name }.png`;

    const selectModel = (model: IRoomModel, index: number) =>
    {
        if(!model) return;

        if (GetClubMemberLevel() < model.clubLevel) return CreateLinkEvent('habboUI/open/hccenter');

        setSelectedModelName(roomModels[index].name);
    }

    const createRoom = () =>
    {
        if (!name || (name.length < 3)) return;

        SendMessageComposer(new CreateFlatMessageComposer(name, description, 'model_' + selectedModelName, Number(category), Number(visitorsCount), tradesSetting));
    }

    useEffect(() =>
    {
        if(!maxVisitorsList)
        {
            const list = [];

            for(let i = 10; i <= 100; i = i + 10) list.push(i);

            setMaxVisitorsList(list);
            setVisitorsCount(list[0]);
        }
    }, [ maxVisitorsList ]);

    useEffect(() =>
    {
        if(categories && categories.length) setCategory(categories[0].id);
    }, [ categories ]);

    useEffect(() =>
    {
        const models = GetConfiguration<IRoomModel[]>('navigator.room.models');

        if(models && models.length)
        {
            setRoomModels(models);
            setSelectedModelName(models[0].name);
        }
    }, []);

    return (
        <NitroCardView className="nitro-room-creator" theme="primary">
            <NitroCardHeaderView headerText={ LocalizeText('navigator.createroom.title') } onCloseClick={ event => CreateLinkEvent('navigator/close-creator') } />
            <NitroCardContentView>
                <Column overflow="hidden">
                    <Grid overflow="hidden">
                        <Column size={ 5 } gap={ 1 } overflow="auto" className="px-2 py-1">
                            <Column gap={ 1 }>
                                <Text >{ LocalizeText('navigator.createroom.roomnameinfo') }</Text>
                                <input type="text" className={ `room-creator-form ${ (!name || (name.length < 3)) ? 'input-error' : '' }` } maxLength={ 60 } onChange={ event => setName(event.target.value) } placeholder={ LocalizeText('navigator.createroom.roomnameinfo') } />
                                { (!name || (name.length < 3)) && <LayoutInputErrorView text={ LocalizeText('navigator.createroom.nameerr') } /> }
                            </Column>
                            <Column grow gap={ 1 }>
                                <Text >{ LocalizeText('navigator.createroom.roomdescinfo') }</Text>
                                <textarea className="flex-grow-1 room-creator-form" maxLength={ 255 } onChange={ event => setDescription(event.target.value) } placeholder={ LocalizeText('navigator.createroom.roomdescinfo') } />
                            </Column>
                            <Column gap={ 1 }>
                                <Text >{ LocalizeText('navigator.category') }</Text>
                                <select className="form-select form-select-sm" onChange={ event => setCategory(Number(event.target.value)) }>
                                    { categories && (categories.length > 0) && categories.map(category =>
                                    {
                                        return <option key={ category.id } value={ category.id }>{ LocalizeText(category.name) }</option>
                                    }) }
                                </select>
                            </Column>
                            <Column gap={ 1 }>
                                <Text >{ LocalizeText('navigator.maxvisitors') }</Text>
                                <select className="form-select form-select-sm" onChange={ event => setVisitorsCount(Number(event.target.value)) }>
                                    { maxVisitorsList && maxVisitorsList.map(value =>
                                    {
                                        return <option key={ value } value={ value }>{ value }</option>
                                    }) }
                                </select>
                            </Column>
                            <Column gap={ 1 }>
                                <Text >{ LocalizeText('navigator.tradesettings') }</Text>
                                <select className="form-select form-select-sm" onChange={ event => setTradesSetting(Number(event.target.value)) }>
                                    <option value="0">{ LocalizeText('navigator.roomsettings.trade_not_allowed') }</option>
                                    <option value="1">{ LocalizeText('navigator.roomsettings.trade_not_with_Controller') }</option>
                                    <option value="2">{ LocalizeText('navigator.roomsettings.trade_allowed') }</option>
                                </select>
                            </Column>
                            <Flex gap={ 2 }>
                                <Button fullWidth className="volter-bold-button text-black" onClick={ createRoom }>{ LocalizeText('navigator.createroom.create') }</Button>
                                <Button fullWidth className="volter-button text-black" onClick={ event => CreateLinkEvent('navigator/close-creator') } >{ LocalizeText('cancel') }</Button>
                            </Flex>
                        </Column>
                        <Column size={ 7 } gap={ 1 } overflow="auto">
                            <AutoGrid className="room-creator-grid" gap={ 1 } columnCount={ 2 } columnMinWidth={ 100 } columnMinHeight={ 50 } overflow="unset">
                                {
                                    roomModels.map((model, index )=>
                                    {
                                        return (<RoomCreatorGridItem fullHeight key={ model.name } onClick={ () => selectModel(model, index) } itemActive={ (selectedModelName === model.name) } overflow="unset" gap={ 0 } className="py-3">
                                            <Flex fullHeight center overflow="hidden">
                                                <img alt="" src={ getRoomModelImage(model.name) } />
                                            </Flex>
                                            <Text position="absolute" className="bottom-1 start-1"><Base className={ `icon ${ selectedModelName === model.name ? 'icon-tiles_room_selected' : 'icon-tiles' }` } /> { model.tileSize } { LocalizeText('navigator.createroom.tilesize') }</Text>
                                            { !hcDisabled && model.clubLevel > HabboClubLevelEnum.NO_CLUB && <Base className="icon icon-hc_mini position-absolute top-1 end-1" /> }
                                            { selectedModelName && <i className="active-arrow"/> }
                                        </RoomCreatorGridItem>);
                                    })
                                }
                            </AutoGrid>
                        </Column>
                    </Grid>
                </Column>

            </NitroCardContentView>
        </NitroCardView>
    );
}
