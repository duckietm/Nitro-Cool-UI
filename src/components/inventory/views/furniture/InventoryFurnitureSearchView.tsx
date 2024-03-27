import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { GroupItem, LocalizeText } from '../../../../api';
import { Button, Flex } from '../../../../common';
import { useLocalStorage } from '../../../../hooks';

export interface InventoryFurnitureSearchViewProps
{
    groupItems: GroupItem[];
    setGroupItems: Dispatch<SetStateAction<GroupItem[]>>;
}

export const InventoryFurnitureSearchView: FC<InventoryFurnitureSearchViewProps> = props =>
{
    const { groupItems = [], setGroupItems = null } = props;
    const [ searchValue, setSearchValue ] = useLocalStorage('inventoryFurnitureSearchValue', '');

    useEffect(() =>
    {
        let filteredGroupItems = [ ...groupItems ];

        if(searchValue && searchValue.length)
        {
            const comparison = searchValue.toLocaleLowerCase();

            filteredGroupItems = groupItems.filter(item =>
            {
                if(comparison && comparison.length)
                {
                    if(comparison === 'rare' && item.isSellable) return item;
                    if(comparison !== 'rare' && item.name.toLocaleLowerCase().includes(comparison)) return item;
                }

                return null;
            });
        }

        setGroupItems(filteredGroupItems);
    }, [ groupItems, setGroupItems, searchValue ]);

    return (
        <Flex gap={ 1 }>
            <input type="text" className="form-control form-control-sm" placeholder={ LocalizeText('generic.search') } value={ searchValue } onChange={ event => setSearchValue(event.target.value) } />
            <Button variant="primary">
                <FaSearch className="fa-icon" />
            </Button>
        </Flex>
    );
}
