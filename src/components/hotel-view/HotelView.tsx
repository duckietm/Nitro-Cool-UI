import { GetConfiguration } from '@nitrots/nitro-renderer';
import { FC, useRef, useState } from 'react';
import { GetConfigurationValue } from '../../api';
import { RoomWidgetView } from './RoomWidgetView';

export const HotelView: FC<{}> = props => {
    const backgroundColor = GetConfigurationValue('hotelview')['images']['background.colour'];
    console.log('Background color:', backgroundColor);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return; // Only left mouse button
        setIsDragging(true);
        setStartX(e.pageX + scrollLeft);
        setStartY(e.pageY + scrollTop);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX;
        const y = e.pageY;
        const newScrollLeft = startX - x;
        const newScrollTop = startY - y;

        if (containerRef.current) {
            containerRef.current.scrollLeft = newScrollLeft;
            containerRef.current.scrollTop = newScrollTop;
            setScrollLeft(newScrollLeft);
            setScrollTop(newScrollTop);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    return (
        <div 
            ref={containerRef}
            className="nitro-hotel-view block fixed w-full h-[calc(100%-55px)] text-[#000]" 
            style={{
                ...(backgroundColor ? { background: backgroundColor } : {}),
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100vw',
                maxHeight: '100vh',
                msOverflowStyle: 'none', // IE and Edge
                scrollbarWidth: 'none', // Firefox
                '::-webkit-scrollbar': { display: 'none' }, // Chrome, Safari, and newer Edge
                cursor: 'grab' // Initial cursor state
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="hotelview position-relative"
                style={{
                    minWidth: '2600px', // 3000px width - 400px left margin
                    minHeight: '1425px' // 1185px height + 240px top margin
                }}
            >
                <div className="hotelview-background w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }} />
                <RoomWidgetView />
            </div>
        </div>
    );
};