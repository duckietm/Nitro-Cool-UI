import { GetSessionDataManager, FurniturePickupAllComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useState } from 'react';
import { LocalizeText, RoomObjectItem, SendMessageComposer } from '../../../../api';
import { Button, Flex, InfiniteScroll, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../../common';
import { NitroInput, classNames } from '../../../../layout';

const LIMIT_FURNI_PICKALL = 100;

interface ChooserWidgetViewProps {
    title: string;
    items: RoomObjectItem[];
    selectItem: (item: RoomObjectItem) => void;
    onClose: () => void;
    pickallFurni?: boolean;
}

export const ChooserWidgetView: FC<ChooserWidgetViewProps> = props => {
    const { title = null, items = [], selectItem = null, onClose = null, pickallFurni = false } = props;
    const [ selectedItem, setSelectedItem ] = useState<RoomObjectItem>(null);
    const [ searchValue, setSearchValue ] = useState('');
    const [ checkAll, setCheckAll ] = useState(false);
    const [ checkedIds, setCheckedIds ] = useState<number[]>([]);
    const canSeeId = GetSessionDataManager().isModerator;

    const checkedId = (id?: number) => {
        if (id) {
            if (isChecked(id))
                setCheckedIds(checkedIds.filter(x => x !== id));
            else if (checkedIds.length < LIMIT_FURNI_PICKALL)
                setCheckedIds([ ...checkedIds, id ]);
        } else {
            setCheckAll(value => !value);
            if (!checkAll) {
                const itemIds = filteredItems.map(x => x.id).slice(0, LIMIT_FURNI_PICKALL);
                setCheckedIds(itemIds);
            } else {
                setCheckedIds([]);
            }
        }
    }

    const isChecked = (id: number) => checkedIds.includes(id);

    const onClickPickAll = () => {
        SendMessageComposer(new FurniturePickupAllComposer(...checkedIds));
        setCheckedIds([]);
        setCheckAll(false);
    }

    const filteredItems = useMemo(() => {
        const value = searchValue.toLocaleLowerCase();
        const itemsFilter = items.filter(item => item.name?.toLocaleLowerCase().includes(value));
        return itemsFilter.sort((a, b) => a.name.localeCompare(b.name));
    }, [ items, searchValue ]);

    useEffect(() => {
        if (!selectedItem) return;
        selectItem(selectedItem);
    }, [ selectedItem, selectItem ]);

    return (
        <NitroCardView className="w-[200px] h-[200px]" theme="primary-slim">
            <NitroCardHeaderView headerText={ title + (pickallFurni ? ` (${filteredItems.length})` : '') } onCloseClick={ onClose } />
            <NitroCardContentView gap={ 2 } overflow="hidden">
                <NitroInput placeholder={ LocalizeText('generic.search') } type="text" value={ searchValue } onChange={ event => setSearchValue(event.target.value) } />
                { pickallFurni && (
                    <Flex gap={ 2 }>
                        <input className="form-check-input" type="checkbox" checked={ checkAll } onChange={ () => checkedId() } />
                        <Text>{ LocalizeText('widget.chooser.checkall') }</Text>
                    </Flex>
                )}
                <InfiniteScroll rowRender={ row => (
                    <Flex pointer alignItems="center" className={ classNames('rounded p-1', (selectedItem === row) && 'bg-muted') } onClick={ () => setSelectedItem(row) }>
                        { pickallFurni && (
                            <input 
                                className="flex-shrink-0 mx-1 form-check-input" 
                                type="checkbox" 
                                checked={ isChecked(row.id) } 
                                onChange={ () => checkedId(row.id) }
                                onClick={ e => e.stopPropagation() }
                            />
                        )}
                        <Text truncate>{ row.name } { canSeeId && (' - ' + row.id) }</Text>
                    </Flex>
                )} rows={ filteredItems } />
                { pickallFurni && (
                    <Button variant="secondary" onClick={ onClickPickAll } disabled={ !checkedIds.length }>
                        { LocalizeText('widget.chooser.btn.pickall') }
                    </Button>
                )}
            </NitroCardContentView>
        </NitroCardView>
    );
};