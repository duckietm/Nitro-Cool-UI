import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { GroupBadgePart } from '../../../api';
import { Base, Column, Flex, Grid, LayoutBadgeImageView } from '../../../common';
import { useGroup } from '../../../hooks';

interface GroupBadgeCreatorViewProps
{
    badgeParts: GroupBadgePart[] | null;
    setBadgeParts: Dispatch<SetStateAction<GroupBadgePart[]>>;
    onBadgeCodeUpdate?: (badgeCode: string) => void;
}

const POSITIONS: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ];

export const GroupBadgeCreatorView: FC<GroupBadgeCreatorViewProps> = props =>
{
    const { badgeParts = [], setBadgeParts = null, onBadgeCodeUpdate = null } = props;
    const [ selectedIndex, setSelectedIndex ] = useState<number>(-1);
    const { groupCustomize = null } = useGroup();

    const setPartProperty = (partIndex: number, property: string, value: number) =>
    {
        const newBadgeParts = [ ...badgeParts ];
        
        newBadgeParts[partIndex][property] = value;

        setBadgeParts(newBadgeParts);
        
        if(property === 'key') setSelectedIndex(-1);
    };

    // Helper function to generate a full group badge code with all parts
    const getFullBadgeCode = (index: number): string => {
        if (!badgeParts) return '';

        let badgeCode = '';

        badgeParts.forEach(part => {
            if (part.code && part.code.length > 0) {
                badgeCode += part.code;
            }
            // Exclude unset symbols (key: 0) from the badge code
        });

        console.log('GroupBadgeCreatorView: Computed full badge code', { badgeCode });

        return badgeCode;
    };

    // Debug the contents of badgeBases and badgeSymbols
    console.log('GroupBadgeCreatorView: badgeBases', groupCustomize?.badgeBases);
    console.log('GroupBadgeCreatorView: badgeSymbols', groupCustomize?.badgeSymbols);

    // Compute the full badge code
    const fullBadgeCode = getFullBadgeCode(0);

    useEffect(() => {
        console.log('GroupBadgeCreatorView: useEffect triggered', { fullBadgeCode, hasOnBadgeCodeUpdate: !!onBadgeCodeUpdate });
        if (onBadgeCodeUpdate && fullBadgeCode) {
            console.log('GroupBadgeCreatorView: Propagating badge code to parent', { fullBadgeCode });
            onBadgeCodeUpdate(fullBadgeCode);
        }
    }, [fullBadgeCode, onBadgeCodeUpdate]);

    // Early return after all hooks are called
    if (!badgeParts || !badgeParts.length) return null;

    return (
        <>
            { ((selectedIndex < 0) && badgeParts && (badgeParts.length > 0)) && badgeParts.map((part, index) =>
            {
                const badgeCode = badgeParts[index].code;
                console.log('GroupBadgeCreatorView: Rendering badge part', { index, badgeCode, fullBadgeCode, part });

                return (
                    <Flex key={ index } alignItems="center" justifyContent="between" gap={ 2 } className="bg-muted rounded px-2 py-1">
                        <Flex pointer center className="bg-muted rounded p-1" onClick={ event => setSelectedIndex(index) }>
                            { (badgeCode && badgeCode.length > 0) ? (
                                <LayoutBadgeImageView badgeCode={ badgeCode } isGroup={ true } />
                            ) : (
                                <Flex center className="badge-image group-badge">
                                    <FaPlus className="fa-icon" />
                                </Flex>
                            )}
                        </Flex>
                        { (part.type !== GroupBadgePart.BASE) &&
                        <Grid gap={ 1 } columnCount={ 3 }>
                            { POSITIONS.map((position, posIndex) =>
                            {
                                return <Base key={ posIndex } pointer className={ `group-badge-position-swatch ${ (badgeParts[index].position === position) ? 'active' : '' }` } onClick={ event => setPartProperty(index, 'position', position) }></Base>
                            }) }
                        </Grid> }
                        <Grid gap={ 1 } columnCount={ 8 }>
                            { (groupCustomize.badgePartColors.length > 0) && groupCustomize.badgePartColors.map((item, colorIndex) =>
                            {
                                return <Base key={ colorIndex } pointer className={ `group-badge-color-swatch ${ (badgeParts[index].color === (colorIndex + 1)) ? 'active' : '' }` } style={ { backgroundColor: '#' + item.color } } onClick={ event => setPartProperty(index, 'color', (colorIndex + 1)) }></Base>
                            }) }
                        </Grid>
                    </Flex>
                );
            }) }
            { (selectedIndex >= 0) &&
                <Grid gap={ 1 } columnCount={ 5 }>
                    { (badgeParts[selectedIndex].type === GroupBadgePart.SYMBOL) &&
                        <Column pointer center className="bg-muted rounded p-1" onClick={ event => setPartProperty(selectedIndex, 'key', 0) }>
                            <Flex center className="badge-image group-badge">
                                <FaTimes className="fa-icon" />
                            </Flex>
                        </Column> }
                    { ((badgeParts[selectedIndex].type === GroupBadgePart.BASE) ? groupCustomize.badgeBases : groupCustomize.badgeSymbols).map((item, index) =>
                    {
                        const badgeCode = GroupBadgePart.getCode(badgeParts[selectedIndex].type, item.id, badgeParts[selectedIndex].color, 4);
                        console.log('GroupBadgeCreatorView: Rendering template badge', { type: badgeParts[selectedIndex].type, id: item.id, badgeCode, color: badgeParts[selectedIndex].color, position: badgeParts[selectedIndex].position, item });

                        return (
                            <Column key={ index } pointer center className="bg-muted rounded p-1" onClick={ event => setPartProperty(selectedIndex, 'key', item.id) }>
                                <LayoutBadgeImageView badgeCode={ badgeCode } isGroup={ true } />
                            </Column>
                        );
                    }) }
                </Grid> }
        </>
    );
};