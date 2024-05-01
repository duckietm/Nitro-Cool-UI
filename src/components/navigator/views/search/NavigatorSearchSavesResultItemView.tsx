import { NavigatorDeleteSavedSearchComposer, NavigatorSavedSearch, NavigatorSearchComposer } from '@nitrots/nitro-renderer';
import { FC, useState } from 'react';
import { LocalizeText, SendMessageComposer } from '../../../../api';
import { Base, Flex, Text } from '../../../../common';

export interface NavigatorSearchSavesResultItemViewProps
{
    search: NavigatorSavedSearch
}

export const NavigatorSearchSavesResultItemView: FC<NavigatorSearchSavesResultItemViewProps> = props =>
{
    const { search = null } = props;
    const [ isHoverText, setIsHoverText ] = useState<boolean>(false);
    const [ currentIndex, setCurrentIndex ] = useState<number>(0);

    const onHover = (searchId: number) =>
    {
        setCurrentIndex(searchId);
        setIsHoverText(true);
    }

    const onLeave = () =>
    {
        setCurrentIndex(0);
        setIsHoverText(false);
    }

    const getResultTitle = () =>
    {
        let name = search.code;

        if(!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return search.code;

        if(name.startsWith('${')) return name.slice(2, (name.length - 1));

        return ('navigator.searchcode.title.' + name);
    }

    return (
        <Flex grow pointer alignItems="center" gap={ 1 } onMouseEnter={ () => onHover(search.id) } onMouseLeave={ () => onLeave() }>
            { (isHoverText && currentIndex === search.id) &&
            <Base className="icon nitro-navigator-search-delete" title={ LocalizeText('navigator.tooltip.remove.saved.search') } onClick={ () => SendMessageComposer(new NavigatorDeleteSavedSearchComposer(search.id)) } /> }
            <Text small pointer variant="black" title={ LocalizeText('navigator.tooltip.open.saved.search') } onClick={ () => SendMessageComposer(new NavigatorSearchComposer(search.code.split('.').reverse()[0], search.filter)) }>{ LocalizeText(getResultTitle()) }</Text>
        </Flex>
    );
}
