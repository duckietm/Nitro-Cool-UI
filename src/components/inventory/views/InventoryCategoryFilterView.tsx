import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { GroupItem, LocalizeBadgeName, LocalizeText } from '../../../api';
import { Flex } from '../../../common';
import { InventoryFilterType, TAB_BADGES, TAB_FURNITURE } from '../constants';

export interface InventoryCategoryFilterViewProps
{
    currentTab: string;
    groupItems: GroupItem[];
    badgeCodes: string[];
    setGroupItems: Dispatch<SetStateAction<GroupItem[]>>;
    setBadgeCodes: Dispatch<SetStateAction<string[]>>;
}

export const InventoryCategoryFilterView: FC<InventoryCategoryFilterViewProps> = props =>
{
    const { currentTab = null, groupItems = [], badgeCodes = [], setGroupItems = null, setBadgeCodes = null } = props;
    const [ filterType, setFilterType ] = useState<string>(InventoryFilterType.EVERYTHING);
    const [ filterPlace, setFilterPlace ] = useState<string>(InventoryFilterType.IN_INVENTORY);
    const [ searchValue, setSearchValue ] = useState('');

    useEffect(() =>
    {
        if (currentTab !== TAB_BADGES) return;

        let filteredBadgeCodes = [ ...badgeCodes ];

        const filteredBadges = badgeCodes.filter( badge => badge.startsWith('ACH_') );

        const numberMap = {};

        filteredBadges.forEach(badge =>
        {
            const name = badge.split(/[\d]+/)[0];
            const number = Number(badge.replace(name, ''));
            
            if (numberMap[name] === undefined || number > numberMap[name])
            {
                numberMap[name] = number;
            }
        });

        const allBadges = Object.keys(numberMap).map( name => `${ name }${ numberMap[name] }` ).concat( badgeCodes.filter( badge => !badge.startsWith('ACH_') ) );

        filteredBadgeCodes = allBadges.filter(badgeCode =>
        {            
            return LocalizeBadgeName(badgeCode).toLocaleLowerCase().includes(searchValue?.toLocaleLowerCase().replace(' ', ''));
        });
        
        setBadgeCodes(filteredBadgeCodes);

    }, [ badgeCodes, currentTab, searchValue, setBadgeCodes ]);
    
    useEffect(() =>
    {
        if (currentTab !== TAB_FURNITURE) return;

        let filteredGroupItems = [ ...groupItems ];

        const comparison = searchValue.toLocaleLowerCase();

        if (filterType === InventoryFilterType.EVERYTHING) return setGroupItems(groupItems.filter( item => item.name.toLocaleLowerCase().includes(comparison) ));

        filteredGroupItems = groupItems.filter(item =>
        {            
            const isWallFilter = (filterType === InventoryFilterType.WALL) ? item.isWallItem : false;
            const isFloorFilter = (filterType === InventoryFilterType.FLOOR) ? !item.isWallItem : false;
            const isSearchFilter = (item.name.toLocaleLowerCase().includes(comparison)) ? true : false;
                
            return comparison && comparison.length ? (isSearchFilter && (isWallFilter || isFloorFilter)) : isWallFilter || isFloorFilter;
        });

        setGroupItems(filteredGroupItems);
    }, [ groupItems, setGroupItems, searchValue, filterType, currentTab ]);

    useEffect(() =>
    {
        setFilterType(InventoryFilterType.EVERYTHING);
        setFilterPlace(InventoryFilterType.IN_INVENTORY);
        setSearchValue('');
    }, [ currentTab ]);
    
    return (
        <Flex className="nitro-inventory-category-filter rounded p-1 mt-n1" style={ { width: currentTab === TAB_BADGES ? '320px' : '100%' } }>
            <Flex className="position-relative">
                <Flex fullWidth alignItems="center" position="relative">
                    <input type="text" className="form-control form-control-sm" value={ searchValue } onChange={ event => setSearchValue(event.target.value) } placeholder={ LocalizeText('catalog.search') }/>
                </Flex>
                { (searchValue && !!searchValue.length) && <i className="icon icon-clear position-absolute cursor-pointer end-1 top-1" onClick={ event => setSearchValue('') } /> }
            </Flex>
            { (currentTab !== TAB_BADGES) &&
                <>
                    <Flex alignItems="center" position="relative" className="ms-2">
                        <select className="form-select form-select-sm" value={ filterType } onChange={ event => setFilterType(event.target.value) }>
                            { [ InventoryFilterType.EVERYTHING, InventoryFilterType.FLOOR, InventoryFilterType.WALL ].map((type, index) => <option key={ index } value={ type }>{ LocalizeText(type) }</option>) }
                        </select>
                    </Flex>
                    <Flex alignItems="center" position="relative" className="ms-2">
                        <select className="form-select form-select-sm" value={ filterPlace } onChange={ event => setFilterPlace(event.target.value) } disabled={ currentTab === TAB_FURNITURE }>
                            { [ InventoryFilterType.ANYWHERE, InventoryFilterType.IN_ROOM, InventoryFilterType.IN_INVENTORY ].map((type, index) => <option key={ index } value={ type }>{ LocalizeText(type) }</option>) }
                        </select>
                    </Flex>
                </>
            }
        </Flex>
    );
}
