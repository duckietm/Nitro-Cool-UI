import { MouseEventType, TouchEventType } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, Key, MouseEvent as ReactMouseEvent, ReactNode, TouchEvent as ReactTouchEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GetLocalStorage, SetLocalStorage, WindowSaveOptions } from '../../api';
import { DraggableWindowPosition } from './DraggableWindowPosition';

const CURRENT_WINDOWS: HTMLElement[] = [];
const POS_MEMORY: Map<Key, { x: number, y: number }> = new Map();
const BOUNDS_THRESHOLD_TOP: number = 0;
const BOUNDS_THRESHOLD_LEFT: number = 0;

export interface DraggableWindowProps {
    uniqueKey?: Key;
    handleSelector?: string;
    windowPosition?: string;
    disableDrag?: boolean;
    dragStyle?: CSSProperties;
    offsetLeft?: number;
    offsetTop?: number;
    children?: ReactNode;
}

export const DraggableWindow: FC<DraggableWindowProps> = props => {
    const { uniqueKey = null, handleSelector = '.drag-handler', windowPosition = DraggableWindowPosition.CENTER, disableDrag = false, dragStyle = {}, children = null, offsetLeft = 0, offsetTop = 0 } = props;
    const [delta, setDelta] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [start, setStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isPositioned, setIsPositioned] = useState(false); // New state to control visibility
    const [dragHandler, setDragHandler] = useState<HTMLElement>(null);
    const elementRef = useRef<HTMLDivElement>();

    const bringToTop = useCallback(() => {
        let zIndex = 400;
        for (const existingWindow of CURRENT_WINDOWS) {
            zIndex += 1;
            existingWindow.style.zIndex = zIndex.toString();
        }
    }, []);

    const moveCurrentWindow = useCallback(() => {
        const index = CURRENT_WINDOWS.indexOf(elementRef.current);
        if (index === -1) {
            CURRENT_WINDOWS.push(elementRef.current);
        } else if (index === (CURRENT_WINDOWS.length - 1)) return;
        else if (index >= 0) {
            CURRENT_WINDOWS.splice(index, 1);
            CURRENT_WINDOWS.push(elementRef.current);
        }
        bringToTop();
    }, [bringToTop]);

    const onMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        moveCurrentWindow();
    }, [moveCurrentWindow]);

    const onTouchStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
        moveCurrentWindow();
    }, [moveCurrentWindow]);

    const startDragging = useCallback((startX: number, startY: number) => {
        setStart({ x: startX, y: startY });
        setIsDragging(true);
    }, []);

    const onDragMouseDown = useCallback((event: MouseEvent) => {
        startDragging(event.clientX, event.clientY);
    }, [startDragging]);

    const onTouchDown = useCallback((event: TouchEvent) => {
        const touch = event.touches[0];
        startDragging(touch.clientX, touch.clientY);
    }, [startDragging]);

    const clampPosition = useCallback((newX: number, newY: number) => {
        if (!elementRef.current) return { x: newX, y: newY };

        const windowWidth = elementRef.current.offsetWidth;
        const windowHeight = elementRef.current.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const clampedX = Math.max(BOUNDS_THRESHOLD_LEFT, Math.min(newX, viewportWidth - windowWidth));
        const clampedY = Math.max(BOUNDS_THRESHOLD_TOP, Math.min(newY, viewportHeight - windowHeight));

        return { x: clampedX, y: clampedY };
    }, []);

    const onDragMouseMove = useCallback((event: MouseEvent) => {
        if (!elementRef.current || !isDragging) return;

        const newDeltaX = event.clientX - start.x;
        const newDeltaY = event.clientY - start.y;
        const newOffsetX = offset.x + newDeltaX;
        const newOffsetY = offset.y + newDeltaY;

        const clampedPos = clampPosition(newOffsetX, newOffsetY);
        setDelta({ x: clampedPos.x - offset.x, y: clampedPos.y - offset.y });
    }, [start, offset, clampPosition, isDragging]);

    const onDragTouchMove = useCallback((event: TouchEvent) => {
        if (!elementRef.current || !isDragging) return;

        const touch = event.touches[0];
        const newDeltaX = touch.clientX - start.x;
        const newDeltaY = touch.clientY - start.y;
        const newOffsetX = offset.x + newDeltaX;
        const newOffsetY = offset.y + newDeltaY;

        const clampedPos = clampPosition(newOffsetX, newOffsetY);
        setDelta({ x: clampedPos.x - offset.x, y: clampedPos.y - offset.y });
    }, [start, offset, clampPosition, isDragging]);

    const completeDrag = useCallback(() => {
        if (!elementRef.current || !dragHandler || !isDragging) return;

        const finalOffsetX = offset.x + delta.x;
        const finalOffsetY = offset.y + delta.y;
        const clampedPos = clampPosition(finalOffsetX, finalOffsetY);

        setDelta({ x: 0, y: 0 });
        setOffset({ x: clampedPos.x, y: clampedPos.y });
        setIsDragging(false);

        if (uniqueKey !== null) {
            const newStorage = { ...GetLocalStorage<WindowSaveOptions>(`nitro.windows.${uniqueKey}`) } as WindowSaveOptions;
            newStorage.offset = { x: clampedPos.x, y: clampedPos.y };
            SetLocalStorage<WindowSaveOptions>(`nitro.windows.${uniqueKey}`, newStorage);
        }
    }, [dragHandler, delta, offset, uniqueKey, clampPosition, isDragging]);

    const onDragMouseUp = useCallback((event: MouseEvent) => {
        completeDrag();
    }, [completeDrag]);

    const onDragTouchUp = useCallback((event: TouchEvent) => {
        completeDrag();
    }, [completeDrag]);

    useEffect(() => {
        const element = elementRef.current as HTMLElement;
        if (!element) return;

        CURRENT_WINDOWS.push(element);
        bringToTop();

        if (!disableDrag) {
            const handle = element.querySelector(handleSelector);
            if (handle) setDragHandler(handle as HTMLElement);
        }

        const windowWidth = element.offsetWidth || 340;
        const windowHeight = element.offsetHeight || 462;
        let offsetX = 0;
        let offsetY = 0;

        switch (windowPosition) {
            case DraggableWindowPosition.TOP_CENTER:
                offsetY = 50 + offsetTop;
                offsetX = (window.innerWidth - windowWidth) / 2 + offsetLeft;
                break;
            case DraggableWindowPosition.CENTER:
                offsetY = (window.innerHeight - windowHeight) / 2 + offsetTop;
                offsetX = (window.innerWidth - windowWidth) / 2 + offsetLeft;
                break;
            case DraggableWindowPosition.TOP_LEFT:
                offsetY = 50 + offsetTop;
                offsetX = 50 + offsetLeft;
                break;
        }

        const clampedPos = clampPosition(offsetX, offsetY);
        element.style.left = '0px';
        element.style.top = '0px';
        setOffset({ x: clampedPos.x, y: clampedPos.y });
        setDelta({ x: 0, y: 0 });
        setIsPositioned(true); // Mark as positioned after setting initial offset

        return () => {
            const index = CURRENT_WINDOWS.indexOf(element);
            if (index >= 0) CURRENT_WINDOWS.splice(index, 1);
        };
    }, [handleSelector, windowPosition, uniqueKey, disableDrag, offsetLeft, offsetTop, bringToTop]);

    useEffect(() => {
        const element = elementRef.current as HTMLElement;
        if (!element || !isPositioned) return;

        element.style.transform = `translate(${offset.x + delta.x}px, ${offset.y + delta.y}px)`;
        element.style.visibility = 'visible';
    }, [offset, delta, isPositioned]);

    useEffect(() => {
        if (!dragHandler) return;

        dragHandler.addEventListener(MouseEventType.MOUSE_DOWN, onDragMouseDown);
        dragHandler.addEventListener(TouchEventType.TOUCH_START, onTouchDown);

        return () => {
            dragHandler.removeEventListener(MouseEventType.MOUSE_DOWN, onDragMouseDown);
            dragHandler.removeEventListener(TouchEventType.TOUCH_START, onTouchDown);
        };
    }, [dragHandler, onDragMouseDown, onTouchDown]);

    useEffect(() => {
        if (!isDragging) return;

        document.addEventListener(MouseEventType.MOUSE_UP, onDragMouseUp);
        document.addEventListener(TouchEventType.TOUCH_END, onDragTouchUp);
        document.addEventListener(MouseEventType.MOUSE_MOVE, onDragMouseMove);
        document.addEventListener(TouchEventType.TOUCH_MOVE, onDragTouchMove);

        return () => {
            document.removeEventListener(MouseEventType.MOUSE_UP, onDragMouseUp);
            document.removeEventListener(TouchEventType.TOUCH_END, onDragTouchUp);
            document.removeEventListener(MouseEventType.MOUSE_MOVE, onDragMouseMove);
            document.removeEventListener(TouchEventType.TOUCH_MOVE, onDragTouchMove);
        };
    }, [isDragging, onDragMouseUp, onDragMouseMove, onDragTouchUp, onDragTouchMove]);

    useEffect(() => {
        if (!uniqueKey) return;

        const localStorage = GetLocalStorage<WindowSaveOptions>(`nitro.windows.${uniqueKey}`);
        if (!localStorage || !localStorage.offset) return;

        const clampedPos = clampPosition(localStorage.offset.x, localStorage.offset.y);
        setDelta({ x: 0, y: 0 });
        setOffset({ x: clampedPos.x, y: clampedPos.y });
        setIsPositioned(true); // Ensure positioned when loading from storage
    }, [uniqueKey, clampPosition]);

    return createPortal(
        <div
            ref={elementRef}
            className="absolute draggable-window"
            style={{ ...dragStyle, visibility: isPositioned ? 'visible' : 'hidden' }} // Hide until positioned
            onMouseDownCapture={onMouseDown}
            onTouchStartCapture={onTouchStart}
        >
            {children}
        </div>,
        document.getElementById('draggable-windows-container')
    );
};