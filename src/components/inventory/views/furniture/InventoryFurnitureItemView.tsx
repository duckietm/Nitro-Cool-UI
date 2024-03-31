import { MouseEventType } from '@nitrots/nitro-renderer';
import { FC, MouseEvent, useState } from 'react';
import { GroupItem, attemptItemPlacement } from '../../../../api';
import { LayoutGridItem } from '../../../../common';
import { useInventoryFurni } from '../../../../hooks';

export const InventoryFurnitureItemView: FC<{ groupItem: GroupItem, isTrading: boolean, attemptItemOffer: (count: number) => void, setGroupItem: (item: GroupItem) => void }> = props =>
{
    const { groupItem = null, isTrading = null, attemptItemOffer = null, setGroupItem = null, ...rest } = props;
    const [ isMouseDown, setMouseDown ] = useState(false);
    const { selectedItem = null, setSelectedItem = null } = useInventoryFurni();

    const onMouseEvent = (event: MouseEvent) =>
    {
        switch(event.type)
        {
            case MouseEventType.MOUSE_DOWN:
                setSelectedItem(groupItem);
                setMouseDown(true);
                return;
            case MouseEventType.MOUSE_UP:
                setMouseDown(false);
                return;
            case MouseEventType.ROLL_OUT:
                if(!isMouseDown || !(groupItem === selectedItem)) return;

                if (!isTrading) attemptItemPlacement(groupItem);
                return;
            case 'dblclick':
                if (!isTrading) attemptItemPlacement(groupItem);
                if (isTrading) (setGroupItem(groupItem), attemptItemOffer(1))
                return;
        }
    }

    const count = groupItem.getUnlockedCount();
	
	return <LayoutGridItem className={ !count ? 'inventory-items opacity-0-5 ' : 'inventory-items' } itemImage={ groupItem.iconUrl } itemCount={ groupItem.getUnlockedCount() } itemActive={ (groupItem === selectedItem) } itemUniqueNumber={ groupItem.stuffData.uniqueNumber } itemUnseen={ groupItem.hasUnseenItems } onClick={ event => (count && setGroupItem(groupItem)) } onMouseDown={ onMouseEvent } onMouseUp={ onMouseEvent } onMouseOut={ onMouseEvent } onDoubleClick={ onMouseEvent } { ...rest } />;
}
