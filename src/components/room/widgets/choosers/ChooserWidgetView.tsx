import { FurniturePickupAllComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useState } from 'react';
import { GetSessionDataManager, LocalizeText, RoomObjectItem, SendMessageComposer } from '../../../../api';
import { Base, Button, Flex, InfiniteScroll, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text, classNames } from '../../../../common';

const LIMIT_FURNI_PICKALL = 100;

interface ChooserWidgetViewProps
{
    title: string;
    items: RoomObjectItem[];
    selectItem: (item: RoomObjectItem) => void;
    onClose: () => void;
    pickallFurni?: boolean;
}

export const ChooserWidgetView: FC<ChooserWidgetViewProps> = props =>
{
    const { title = null, items = [], selectItem = null, onClose = null } = props;
    const [ selectedItem, setSelectedItem ] = useState<RoomObjectItem>(null);
    const [ searchValue, setSearchValue ] = useState('');
    const canSeeId = GetSessionDataManager().isModerator;

    const [ checkAll, setCheckAll ] = useState(false);
    const [ checkedIds, setCheckedIds ] = useState<number[]>([]);
    
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
    }

    const filteredItems = useMemo(() =>
    {
        const value = searchValue.toLocaleLowerCase();

        const itemsFilter = items.filter(item => item.name?.toLocaleLowerCase().includes(value));

        const itemsFilterSorted = itemsFilter.sort((a, b) => a.name.localeCompare(b.name));

        return itemsFilterSorted
    }, [ items, searchValue ]);

    useEffect(() =>
    {
        if(!selectedItem) return;

        selectItem(selectedItem);
    }, [ selectedItem, selectItem ]);

    return (
        <NitroCardView className="nitro-chooser-widget" theme="primary-slim">
            <NitroCardHeaderView headerText={ title + ' (' + filteredItems.length + ')' } onCloseClick={ onClose } />
            <NitroCardContentView overflow="hidden" gap={ 1 }>
                <input type="text" className="form-control form-control-sm" placeholder={ LocalizeText('generic.search') } value={ searchValue } onChange={ event => setSearchValue(event.target.value) } />
                { props.pickallFurni && <Flex gap={ 2 } className="text-black">
                    <input className="form-check-input" type="checkbox" checked={ checkAll } onChange={ (e) => checkedId() } />
                    <label className="form-check-label">{ LocalizeText('widget.chooser.checkall') }</label>
                </Flex> }
                <InfiniteScroll rows={ filteredItems } rowRender={ row =>
                {
                    return (
                        <Flex alignItems="center" className={ classNames('rounded p-1', (selectedItem === row) && 'bg-muted') } pointer onClick={ event => setSelectedItem(row) }>
                            { props.pickallFurni && <input className="flex-shrink-0 mx-1 form-check-input" type="checkbox" name="showMyFace" checked={ isChecked(row.id) } onChange={ (e) => checkedId(row.id) } /> }
                            <Text truncate>{ row.name } { canSeeId && (' - ' + row.id) }</Text>
                        </Flex>
                    );
                } } />
                { props.pickallFurni && <Button variant="secondary" onClick={ event => onClickPickAll() } disabled={ !checkedIds.length }>
                    { LocalizeText('widget.chooser.btn.pickall') }
                </Button> }
            </NitroCardContentView>
        </NitroCardView>
    );
}
