import { AdvancedMap } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { GroupItem, LocalizeText, TradeState } from '../../../../api';
import { AutoGrid, Base, Button, Column, Flex, Grid, LayoutGridItem, Text } from '../../../../common';
import { useInventoryTrade } from '../../../../hooks';
import { MAX_ITEMS_TO_TRADE, TABS, TAB_FURNITURE } from '../../constants';

interface InventoryTradeViewProps
{
    currentTab: string;
    setCurrentTab: (value: string) => void;
    cancelTrade: () => void;
}

export const InventoryTradeView: FC<InventoryTradeViewProps> = props =>
{
    const { currentTab = null, setCurrentTab = null, cancelTrade = null } = props;
    const [ ownGroupItem, setOwnGroupItem ] = useState<GroupItem>(null);
    const [ otherGroupItem, setOtherGroupItem ] = useState<GroupItem>(null);
    const [ countdownTick, setCountdownTick ] = useState(3);
    const { ownUser = null, otherUser = null, tradeState = TradeState.TRADING_STATE_READY, progressTrade = null, removeItem = null, setTradeState = null } = useInventoryTrade();

    const getLockIcon = (accepts: boolean) =>
    {
        if(accepts)
        {
            return <Base className="mt-auto mb-5 pb-5 icon icon-lock-locked" />
        }
        else
        {
            return <Base className="mt-auto mb-5 pb-5 icon icon-lock-open" />
        }
    }

    const getTotalCredits = (items: AdvancedMap<string, GroupItem>): number =>
    {
        return items.getValues().map( item => Number(item.iconUrl.split('/')[item.iconUrl.split('/').length - 1]?.split('_')[1]) * item.items.length ).reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0);
    }

    useEffect(() =>
    {
        if(tradeState !== TradeState.TRADING_STATE_COUNTDOWN) return;

        setCountdownTick(3);

        const interval = window.setInterval(() =>
        {
            setCountdownTick(prevValue =>
            {
                const newValue = (prevValue - 1);

                if(newValue === 0) clearInterval(interval);

                return newValue;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [ tradeState, setTradeState ]);

    useEffect(() =>
    {
        if(countdownTick !== 0) return;

        setTradeState(TradeState.TRADING_STATE_CONFIRMING);
    }, [ countdownTick, setTradeState ]);

    if((tradeState === TradeState.TRADING_STATE_READY) || !ownUser || !otherUser) return null;

    return (
        <Column>
            <Column fullWidth size={ 12 } overflow="hidden" className="trade-bg p-2 text-black">
                { currentTab === TAB_FURNITURE &&
                    <>
                        <Text small>{ LocalizeText('inventory.trading.info.add') }</Text>
                        <Grid gap={ 0 } overflow="hidden" className="px-2">
                            <Column size={ 4 } overflow="hidden">
                                <Flex>
                                    { (ownUser.accepts) && <Base className="icon icon-confirmed" /> }
                                    <small className={ ownUser.accepts ? 'px-2' : '' }><b>{ LocalizeText('inventory.trading.you') }</b> { LocalizeText('inventory.trading.areoffering') }</small>
                                </Flex>
                                <AutoGrid columnCount={ 3 } columnMinWidth={ 35 } columnMinHeight={ 35 }>
                                    { Array.from(Array(MAX_ITEMS_TO_TRADE), (e, i) =>
                                    {
                                        const item = (ownUser.userItems.getWithIndex(i) || null);

                                        if(!item) return <LayoutGridItem key={ i } />;

                                        return (
                                            <LayoutGridItem key={ i } itemActive={ (ownGroupItem === item) } itemImage={ item.iconUrl } itemCount={ item.getTotalCount() } itemUniqueNumber={ item.stuffData.uniqueNumber } onClick={ event => setOwnGroupItem(item) } onDoubleClick={ event => removeItem(item) }>
                                                { (ownGroupItem === item) &&
                                                    <Base position="absolute" onClick={ event => removeItem(item) } /> }
                                            </LayoutGridItem>
                                        );
                                    }) }
                                </AutoGrid>
                                <Column gap={ 0 } fullWidth>
                                    <small>{ LocalizeText('inventory.trading.info.itemcount', [ 'value' ], [ ownUser.itemCount.toString() ]) }</small>
                                    <small className="credits-align">{ LocalizeText('inventory.trading.info.creditvalue.own', [ 'value' ], [ getTotalCredits(ownUser.userItems).toString() ]) }</small>
                                </Column>
                            </Column>
                            <Flex className="lock-design-left">
                                { getLockIcon(ownUser.accepts) }
                            </Flex>
                            <Flex className="divisor"></Flex>
                            <Column size={ 4 } overflow="hidden">
                                <Flex>
                                    { (otherUser.accepts) && <Base className="icon icon-confirmed" /> }
                                    <small className={ otherUser.accepts ? 'px-2' : '' }><b>{ otherUser.userName }</b> { LocalizeText('inventory.trading.isoffering') }</small>
                                </Flex>
                                <AutoGrid columnCount={ 3 } columnMinWidth={ 35 } columnMinHeight={ 35 }>
                                    { Array.from(Array(MAX_ITEMS_TO_TRADE), (e, i) =>
                                    {
                                        const item = (otherUser.userItems.getWithIndex(i) || null);

                                        if(!item) return <LayoutGridItem key={ i } />;

                                        return <LayoutGridItem key={ i } itemActive={ (otherGroupItem === item) } itemImage={ item.iconUrl } itemCount={ item.getTotalCount() } itemUniqueNumber={ item.stuffData.uniqueNumber } onClick={ event => setOtherGroupItem(item) } />;
                                    }) }
                                </AutoGrid>
                                <Column gap={ 0 } fullWidth>
                                    <small>{ LocalizeText('inventory.trading.info.itemcount', [ 'value' ], [ otherUser.itemCount.toString() ]) }</small>
                                    <small>{ LocalizeText('inventory.trading.info.creditvalue', [ 'value' ], [ getTotalCredits(otherUser.userItems).toString() ]) }</small>
                                </Column>
                            </Column>
                            <Flex className="lock-design-right">
                                { getLockIcon(otherUser.accepts) }
                            </Flex>
                        </Grid>
                    </>
                }
                { currentTab !== TAB_FURNITURE &&
                    <>
                        <Flex className="px-2">
                            <Base className="flex-shrink-0 icon icon-report-room" />
                            <Text bold>{ LocalizeText('inventory.trading.minimized.trade_in_progress') }</Text>
                        </Flex>
                    </>
                }
                <Flex grow justifyContent="between">
                    { (currentTab === TAB_FURNITURE) &&
                        <>
                            { (tradeState === TradeState.TRADING_STATE_READY) &&
                                <Button variant="secondary" disabled={ (!ownUser.itemCount && !otherUser.itemCount) } onClick={ progressTrade }>{ LocalizeText('inventory.trading.accept') }</Button> }
                            { (tradeState === TradeState.TRADING_STATE_RUNNING) &&
                                <Button variant="secondary" disabled={ (!ownUser.itemCount && !otherUser.itemCount) } onClick={ progressTrade }>{ LocalizeText(ownUser.accepts ? 'inventory.trading.modify' : 'inventory.trading.accept') }</Button> }
                            { (tradeState === TradeState.TRADING_STATE_COUNTDOWN) &&
                                <Button variant="secondary" disabled>{ LocalizeText('inventory.trading.countdown', [ 'counter' ], [ countdownTick.toString() ]) }</Button> }
                            { (tradeState === TradeState.TRADING_STATE_CONFIRMING) &&
                                <Button variant="secondary" onClick={ progressTrade }>{ LocalizeText('inventory.trading.button.restore') }</Button> }
                            { (tradeState === TradeState.TRADING_STATE_CONFIRMED) &&
                                <Button variant="secondary">{ LocalizeText('inventory.trading.info.waiting') }</Button> }
                        </>
                    }
                    { (currentTab !== TAB_FURNITURE) &&
                        <Button variant="secondary" onClick={ () => setCurrentTab(TABS[0]) }>{ LocalizeText('inventory.trading.minimized.continue_trade') }</Button>
                    }
                    <Button variant="danger" onClick={ cancelTrade }>{ LocalizeText('generic.cancel') }</Button>
                </Flex>
            </Column>
        </Column>
    );
}
