import { ConvertGlobalRoomIdMessageComposer, FindNewFriendsMessageComposer, HabboWebTools, ILinkEventTracker, LegacyExternalInterface, NavigatorInitComposer, NavigatorSearchComposer, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AddEventLinkTracker, CreateLinkEvent, LocalizeText, RemoveLinkEventTracker, SendMessageComposer, TryVisitRoom } from '../../api';
import { Base, Column, Flex, LayoutSearchSavesView, NitroCardContentView, NitroCardHeaderView, NitroCardTabsItemView, NitroCardTabsView, NitroCardView, Text } from '../../common';
import { useNavigator, useRoomSessionManagerEvent } from '../../hooks';
import { NavigatorDoorStateView } from './views/NavigatorDoorStateView';
import { NavigatorRoomCreatorView } from './views/NavigatorRoomCreatorView';
import { NavigatorRoomInfoView } from './views/NavigatorRoomInfoView';
import { NavigatorRoomLinkView } from './views/NavigatorRoomLinkView';
import { NavigatorRoomSettingsView } from './views/room-settings/NavigatorRoomSettingsView';
import { NavigatorSearchResultView } from './views/search/NavigatorSearchResultView';
import { NavigatorSearchSavesResultView } from './views/search/NavigatorSearchSavesResultView';
import { NavigatorSearchView } from './views/search/NavigatorSearchView';

export const NavigatorView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isReady, setIsReady ] = useState(false);
    const [ isCreatorOpen, setCreatorOpen ] = useState(false);
    const [ isRoomInfoOpen, setRoomInfoOpen ] = useState(false);
    const [ isRoomLinkOpen, setRoomLinkOpen ] = useState(false);
    const [ isOpenSavesSearchs, setIsOpenSavesSearchs ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ needsInit, setNeedsInit ] = useState(true);
    const [ needsSearch, setNeedsSearch ] = useState(false);
    const { searchResult = null, topLevelContext = null, topLevelContexts = null, navigatorData = null, navigatorSearches = null } = useNavigator();
    const pendingSearch = useRef<{ value: string, code: string }>(null);
    const elementRef = useRef<HTMLDivElement>();

    useRoomSessionManagerEvent<RoomSessionEvent>(RoomSessionEvent.CREATED, event =>
    {
        setIsVisible(false);
        setCreatorOpen(false);
    });

    const sendSearch = useCallback((searchValue: string, contextCode: string) =>
    {
        SendMessageComposer(new NavigatorSearchComposer(contextCode, searchValue));

        setIsLoading(true);
    }, []);

    const reloadCurrentSearch = useCallback(() =>
    {
        if(!isReady)
        {
            setNeedsSearch(true);

            return;
        }

        if(pendingSearch.current)
        {
            sendSearch(pendingSearch.current.value, pendingSearch.current.code);

            pendingSearch.current = null;

            return;
        }

        if(searchResult)
        {
            sendSearch(searchResult.data, searchResult.code);

            return;
        }

        if(!topLevelContext) return;

        sendSearch('', topLevelContext.code);
    }, [ isReady, searchResult, topLevelContext, sendSearch ]);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case 'show': {
                        setIsVisible(true);
                        setNeedsSearch(true);
                        return;
                    }
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle': {
                        if(isVisible)
                        {
                            setIsVisible(false);

                            return;
                        }

                        setIsVisible(true);
                        setNeedsSearch(true);
                        return;
                    }
                    case 'toggle-room-info':
                        setRoomInfoOpen(value => !value);
                        return;
                    case 'toggle-room-link':
                        setRoomLinkOpen(value => !value);
                        return;
                    case 'goto':
                        if(parts.length <= 2) return;

                        switch(parts[2])
                        {
                            case 'home':
                                if(navigatorData.homeRoomId <= 0) return;

                                TryVisitRoom(navigatorData.homeRoomId);
                                break;
                            default: {
                                const roomId = parseInt(parts[2]);

                                TryVisitRoom(roomId);
                            }
                        }
                        return;
                    case 'create':
                        setCreatorOpen(value => !value);
                        return;
                    case 'close-creator':
                        setCreatorOpen(false);
                        return;

                    case 'search':
                        if(parts.length > 2)
                        {
                            const topLevelContextCode = parts[2];

                            let searchValue = '';

                            if(parts.length > 3) searchValue = parts[3];

                            pendingSearch.current = { value: searchValue, code: topLevelContextCode };

                            setIsVisible(true);
                            setNeedsSearch(true);
                        }
                        return;
                }
            },
            eventUrlPrefix: 'navigator/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ isVisible, navigatorData ]);

    useEffect(() =>
    {
        if(!searchResult) return;

        setIsLoading(false);

        if(elementRef && elementRef.current) elementRef.current.scrollTop = 0;
    }, [ searchResult ]);

    useEffect(() =>
    {
        if(!isVisible || !isReady || !needsSearch) return;

        reloadCurrentSearch();

        setNeedsSearch(false);
    }, [ isVisible, isReady, needsSearch, reloadCurrentSearch ]);

    useEffect(() =>
    {
        if(isReady || !topLevelContext) return;

        setIsReady(true);
    }, [ isReady, topLevelContext ]);

    useEffect(() =>
    {
        if(!isVisible || !needsInit) return;

        SendMessageComposer(new NavigatorInitComposer());

        setNeedsInit(false);
    }, [ isVisible, needsInit ]);

    useEffect(() =>
    {
        LegacyExternalInterface.addCallback(HabboWebTools.OPENROOM, (k: string, _arg_2: boolean = false, _arg_3: string = null) => SendMessageComposer(new ConvertGlobalRoomIdMessageComposer(k)));
    }, []);

    return (
        <>
            { isVisible &&
                <NitroCardView uniqueKey="navigator" className={ `nitro-navigator ${ isOpenSavesSearchs ? 'expanded' : '' }` }>
                    <NitroCardHeaderView headerText={ LocalizeText('navigator.title') } isInfoToHabboPages={ true } onClickInfoHabboPages={ () => CreateLinkEvent('habbopages/navigator') } onCloseClick={ event => setIsVisible(false) } />
                    <NitroCardTabsView>
                        <Base className="mt-1">
                            <LayoutSearchSavesView style={ { marginRight: !isOpenSavesSearchs ? '11px' : '91px', marginLeft: '-2px', marginTop: '1px' } } title={ LocalizeText('navigator.tooltip.left.show.hide') } onClick={ () => setIsOpenSavesSearchs(prevValue => !prevValue) } />
                        </Base>
                        { topLevelContexts && (topLevelContexts.length > 0) && topLevelContexts.map((context, index) =>
                        {
                            return (
                                <NitroCardTabsItemView key={ index } isActive={ ((topLevelContext === context)) } onClick={ event => sendSearch('', context.code) }>
                                    { LocalizeText(('navigator.toplevelview.' + context.code)) }
                                </NitroCardTabsItemView>
                            );
                        }) }
                    </NitroCardTabsView>
                    <NitroCardContentView position="relative">
                        { isLoading && <Base fit position="absolute" className="top-0 start-0 z-index-1 bg-muted opacity-0-5" /> }
                        <Column overflow="hidden">
                            <Flex fullWidth fullHeight>
                                { isOpenSavesSearchs &&
                                    <Column overflow="hidden" className="pe-5">
                                        <NavigatorSearchSavesResultView searchs={ navigatorSearches } />
                                    </Column>
                                }
                                <Flex column={ true } className="w-100">
                                    <NavigatorSearchView sendSearch={ sendSearch } />
                                    <Column overflow="auto">
                                        { (searchResult && searchResult.results.map((result, index) => <NavigatorSearchResultView key={ index } searchResult={ result } />)) }
                                    </Column>
                                    <Flex className="nav-bottom">
                                        <Flex className="position-absolute bottom-3">
                                            <Flex className="nav-create-room" onClick={ (event) => setCreatorOpen(value => !value) }>
                                                <Text variant="white" bold className="nav-bottom-buttons-text">
                                                    { LocalizeText('navigator.createroom.create') }
                                                </Text>
                                            </Flex>
                                            { (searchResult?.code !== 'myworld_view' && searchResult?.code !== 'roomads_view') &&
                                                <Flex className="nav-random-room" onClick={ () => SendMessageComposer(new FindNewFriendsMessageComposer()) }>
                                                    <Text variant="white" bold className="nav-bottom-buttons-text">
                                                        { LocalizeText('navigator.random.room') }
                                                    </Text>
                                                </Flex>
                                            }
                                            { (searchResult?.code === 'myworld_view' || searchResult?.code === 'roomads_view') &&
                                                <Flex className="nav-promote-room" onClick={ () => CreateLinkEvent('catalog/open/room_event') }>
                                                    <Text variant="white" bold className="nav-bottom-buttons-text">
                                                        { LocalizeText('navigator.promote.room') }
                                                    </Text>
                                                </Flex>
                                            }
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Column>
                    </NitroCardContentView>
                </NitroCardView> }
            { isCreatorOpen && <NavigatorRoomCreatorView /> }
            <NavigatorDoorStateView />
            { isRoomInfoOpen && <NavigatorRoomInfoView onCloseClick={ () => setRoomInfoOpen(false) } /> }
            { isRoomLinkOpen && <NavigatorRoomLinkView onCloseClick={ () => setRoomLinkOpen(false) } /> }
            <NavigatorRoomSettingsView />
        </>
    );
}
