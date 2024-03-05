import { useVirtualizer } from '@tanstack/react-virtual';
import { FC, Fragment, ReactElement, useEffect, useRef, useState } from 'react';
import { Base } from './Base';
import { UseMountEffect } from '../hooks';

interface InfiniteScrollProps<T = any>
{
    rows: T[];
    overscan?: number;
    scrollToBottom?: boolean;
    rowRender: (row: T) => ReactElement;
}

export const InfiniteScroll: FC<InfiniteScrollProps> = props =>
{
    const { rows = [], overscan = 5, scrollToBottom = false, rowRender = null } = props;
    const scrollIndex = rows.length - 1;
    const parentRef = useRef<HTMLDivElement>(null);

    const { getVirtualItems, getTotalSize, scrollToIndex = null, measureElement } = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 8,
        overscan
    });

    const virtualItems = getVirtualItems();
    const totalSize = getTotalSize();

    const paddingTop = (virtualItems.length > 0) ? (virtualItems?.[0]?.start || 0) : 0
    const paddingBottom = (virtualItems.length > 0) ? (totalSize - (virtualItems?.[virtualItems.length - 1]?.end || 0)) : 0;

    const lastElementVisible = (dataIndexValue: number) =>
    {
        if (!parentRef.current) return false;
      
        const parentElement = parentRef.current;
        const lastElement = parentElement.querySelector(`[data-index="${ dataIndexValue - 1 }"]`);
      
        if (!lastElement) return false;
      
        const lastElementRect = lastElement.getBoundingClientRect();
      
        const { scrollTop, scrollHeight, clientHeight } = parentElement;

        const lastElementVisible = scrollTop + clientHeight + lastElementRect.height >= scrollHeight - lastElementRect.height;

        return lastElementVisible;
    };

    UseMountEffect(() =>
    {
        setTimeout(() => scrollToIndex(scrollIndex), 0)
    });

    useEffect(() =>
    {
        if (!scrollToBottom) return;

        if (!lastElementVisible(scrollIndex)) return;
        
        scrollToIndex(scrollIndex);
    }, [ scrollToBottom, scrollIndex, scrollToIndex ]);

    return (
        <Base fit innerRef={ parentRef } position="relative" overflow="auto">
            { (paddingTop > 0) &&
                <div
                    style={ { minHeight: `${ paddingTop }px` } } /> }
            { virtualItems.map(item => 
            {
                const row = rows[item.index];

                if (!row) return (
                    <Fragment
                        key={ item.key } />
                );

                return (
                    <div
                        key={ item.key }
                        data-index={ item.index }
                        ref={ measureElement }>
                        { rowRender(row) }
                    </div>
                )
            }) }
            { (paddingBottom > 0) &&
                <div
                    style={ { minHeight: `${ paddingBottom }px` } } /> }
        </Base>
    );
}
