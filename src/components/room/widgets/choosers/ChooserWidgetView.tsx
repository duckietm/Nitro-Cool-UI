import { FurniturePickupAllComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useState } from 'react';
import { GetSessionDataManager, LocalizeText, RoomObjectItem, SendMessageComposer, chooserSelectionVisualizer } from '../../../../api';
import { Base, Button, Flex, InfiniteScroll, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text, classNames } from '../../../../common';

const LIMIT_FURNI_PICKALL = 100;

interface ChooserWidgetViewProps
{
    title: string;
    items: RoomObjectItem[];
    selectItem: (item: RoomObjectItem) => void;
    onClose: () => void;
    pickallFurni?: boolean;
    type?: 'furni' | 'users';
}

export const ChooserWidgetView: FC<ChooserWidgetViewProps> = props =>
{
    const { title = null, items = [], selectItem = null, onClose = null, pickallFurni = false, type = 'furni' } = props;
    const [ selectedItems, setSelectedItems ] = useState<RoomObjectItem[]>([]);
    const [ searchValue, setSearchValue ] = useState('');
    const canSeeId = GetSessionDataManager().isModerator;

    const [ checkAll, setCheckAll ] = useState(false);
    const [ checkedIds, setCheckedIds ] = useState<number[]>([]);

    const ownerNames = useMemo(() => {
        const names = Array.from(new Set(items.map(item => item.ownerName || 'Unknown')));
        return names.sort();
    }, [items]);

    const [ selectedFilter, setSelectedFilter ] = useState(() => {
        if (pickallFurni) return 'all';
        return ownerNames.length > 0 ? ownerNames[0] : '';
    });

    useEffect(() => {
        if (!pickallFurni && ownerNames.length > 0 && !selectedFilter) {
            setSelectedFilter(ownerNames[0]);
        }
    }, [pickallFurni, ownerNames, selectedFilter]);

    const checkedId = (id?: number) =>
    {
        if (id) 
        {
            if (isChecked(id))
                setCheckedIds(checkedIds.filter(x => x !== id));
            else if(checkedIds.length < LIMIT_FURNI_PICKALL)
                setCheckedIds([ ...checkedIds, id ]);
        }
        else
        {
            setCheckAll(value => !value);
            
            if (!checkAll)
            {
                const itemIds = filteredItems.map(x => x.id).slice(0, LIMIT_FURNI_PICKALL);
                setCheckedIds(itemIds);
            } 
            else 
            {
                setCheckedIds([]);
            }
        }
    }

    const isChecked = (id: number) => checkedIds.includes(id);

    const onClickPickAll = () =>
    {
        SendMessageComposer(new FurniturePickupAllComposer(...checkedIds));
        setCheckedIds([]);
        setCheckAll(false);
        chooserSelectionVisualizer.clearAll();
        setSelectedItems([]);
    }

    const filteredItems = useMemo(() =>
    {
        const value = searchValue.toLocaleLowerCase();

        return items
            .filter(item => 
            {
                const matchesSearch = item.name?.toLocaleLowerCase().includes(value);
                const matchesFilter = !pickallFurni ? (selectedFilter ? item.ownerName === selectedFilter : true) : (selectedFilter === 'all' || item.ownerName === selectedFilter);
                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [ items, searchValue, selectedFilter, pickallFurni ]);

    useEffect(() =>
    {
        if (selectedItems.length === 0) return;

        selectItem(selectedItems[selectedItems.length - 1]);

        chooserSelectionVisualizer.clearAll();
        selectedItems.forEach(item => {
            if (item.id && item.category) {
                chooserSelectionVisualizer.show(item.id, item.category);
            }
        });
    }, [ selectedItems, selectItem ]);

    const toggleItemSelection = (item: RoomObjectItem) => {
        setSelectedItems(prev => {
            if (prev.some(selected => selected.id === item.id)) {
                chooserSelectionVisualizer.hide(item.id, item.category);
                return prev.filter(selected => selected.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleClose = () => {
        chooserSelectionVisualizer.clearAll();
        setSelectedItems([]);
        onClose();
    };

    return (
        <NitroCardView className="nitro-chooser-widget" theme="primary-slim">
            <NitroCardHeaderView headerText={ title + ' (' + filteredItems.length + ')' } onCloseClick={ handleClose } />
            <NitroCardContentView overflow="hidden" gap={ 1 }>
                <Flex gap={ 2 }>
                    <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder={ LocalizeText('generic.search') } 
                        value={ searchValue } 
                        onChange={ event => setSearchValue(event.target.value) } 
                    />
                    { pickallFurni && (
                        <select
                            className="form-control form-control-sm"
                            value={ selectedFilter }
                            onChange={ event => setSelectedFilter(event.target.value) }
                        >
                            <option value="all">{ LocalizeText('roomsettings.access_rights.anyone') }</option>
                            { ownerNames.length > 0 ? (
                                ownerNames.map((value, index) => (
                                    <option key={ index } value={ value }>{ value }</option>
                                ))
                            ) : (
                                <option disabled>No owners found</option>
                            )}
                        </select>
                    )}
                </Flex>
                { pickallFurni && (
                    <Flex gap={ 2 } className="text-black">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={ checkAll } 
                            onChange={ () => checkedId() } 
                        />
                        <label className="form-check-label">{ LocalizeText('widget.chooser.checkall') }</label>
                    </Flex>
                )}
                <InfiniteScroll 
                    rows={ filteredItems } 
                    rowRender={ row =>
                    {
                        return (
                            <Flex 
                                alignItems="center" 
                                className={ classNames('rounded p-1', selectedItems.some(item => item.id === row.id) && 'bg-muted') } 
                                pointer 
                                onClick={ event => {
                                    toggleItemSelection(row);
                                }}
                            >
                                { pickallFurni && (
                                    <input 
                                        className="flex-shrink-0 mx-1 form-check-input" 
                                        type="checkbox" 
                                        checked={ isChecked(row.id) } 
                                        onChange={ () => checkedId(row.id) } 
                                    />
                                )}
                                <Text truncate>
                                    { row.name } { canSeeId && (' - ' + row.id) } 
                                    { type === 'furni' && row.ownerName && row.ownerName !== '-' && ` (Owner: ${row.ownerName})` }
                                </Text>
                            </Flex>
                        );
                    } }
                    scrollToBottom={ false }
                />
                { pickallFurni && (
                    <Button 
                        variant="secondary" 
                        onClick={ onClickPickAll } 
                        disabled={ !checkedIds.length }
                    >
                        { LocalizeText('widget.chooser.btn.pickall') }
                    </Button>
                )}
            </NitroCardContentView>
        </NitroCardView>
    );
}