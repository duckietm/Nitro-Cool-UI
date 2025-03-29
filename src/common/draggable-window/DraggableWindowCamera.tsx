import { MouseEventType, TouchEventType } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, Key, MouseEvent as ReactMouseEvent, ReactNode, TouchEvent as ReactTouchEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Base } from '..';
import { GetLocalStorage, WindowSaveOptions } from '../../api';
import { DraggableWindowPosition } from './DraggableWindowPosition';

const CURRENT_WINDOWS: HTMLElement[] = [];
const POS_MEMORY: Map<Key, { x: number, y: number }> = new Map();

export interface DraggableWindowCameraProps {
    uniqueKey?: Key;
    handleSelector?: string;
    windowPosition?: string;
    disableDrag?: boolean;
    dragStyle?: CSSProperties;
    offsetLeft?: number;
    offsetTop?: number;
    children?: ReactNode;
}

export const DraggableWindowCamera: FC<DraggableWindowCameraProps> = props => {
    const { uniqueKey = null, handleSelector = '.drag-handler', windowPosition = DraggableWindowPosition.CENTER, disableDrag = false, dragStyle = {}, children = null, offsetLeft = 0, offsetTop = 0 } = props;
    const [ delta, setDelta ] = useState<{ x: number, y: number }>(null);
    const [ offset, setOffset ] = useState<{ x: number, y: number }>(null);
    const [ start, setStart ] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [ isDragging, setIsDragging ] = useState(false);
    const [ dragHandler, setDragHandler ] = useState<HTMLElement>(null);
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
    }, [ bringToTop ]);

    const onMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        moveCurrentWindow();
    }, [ moveCurrentWindow ]);

    const onTouchDownHandler = useCallback((event: TouchEvent) => {
        moveCurrentWindow();
    }, [ moveCurrentWindow ]);

    const startDragging = useCallback((startX: number, startY: number) => {
        setStart({ x: startX, y: startY });
        setIsDragging(true);
    }, []);

    const onDragMouseDown = useCallback((event: MouseEvent) => {
        startDragging(event.clientX, event.clientY);
    }, [ startDragging ]);

    const onTouchDown = useCallback((event: TouchEvent) => {
        const touch = event.touches[0];
        startDragging(touch.clientX, touch.clientY);
    }, [ startDragging ]);

    const onDragMouseMove = useCallback((event: MouseEvent) => {
        setDelta({ x: (event.clientX - start.x), y: (event.clientY - start.y) });
    }, [ start ]);

    const onDragTouchMove = useCallback((event: TouchEvent) => {
        const touch = event.touches[0];
        setDelta({ x: (touch.clientX - start.x), y: (touch.clientY - start.y) });
    }, [ start ]);

    const completeDrag = useCallback(() => {
        if (!elementRef.current || !dragHandler) return;

        let offsetX = offset.x + delta.x;
        let offsetY = offset.y + delta.y;

        const element = elementRef.current;
        const windowWidth = element.offsetWidth;
        const windowHeight = element.offsetHeight;
        const viewportWidth = document.body.offsetWidth;
        const viewportHeight = document.body.offsetHeight;

        // Clamp the position to stay fully within the viewport
        const minX = -element.offsetLeft; // Left boundary (relative to initial position)
        const maxX = viewportWidth - windowWidth - element.offsetLeft; // Right boundary
        const minY = -element.offsetTop; // Top boundary
        const maxY = viewportHeight - windowHeight - element.offsetTop; // Bottom boundary

        offsetX = Math.max(minX, Math.min(offsetX, maxX));
        offsetY = Math.max(minY, Math.min(offsetY, maxY));

        setDelta({ x: 0, y: 0 });
        setOffset({ x: offsetX, y: offsetY });
        setIsDragging(false);

        if (uniqueKey !== null) POS_MEMORY.set(uniqueKey, { x: offsetX, y: offsetY });
    }, [ dragHandler, delta, offset, uniqueKey ]);

    const onDragMouseUp = useCallback((event: MouseEvent) => {
        completeDrag();
    }, [ completeDrag ]);

    const onDragTouchUp = useCallback((event: TouchEvent) => {
        completeDrag();
    }, [ completeDrag ]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        CURRENT_WINDOWS.push(element);
        bringToTop();

        if (!disableDrag) {
            const handle = element.querySelector(handleSelector) as HTMLElement;
            if (handle) setDragHandler(handle);
        }

        let offsetX = 0;
        let offsetY = 0;

        switch (windowPosition) {
            case DraggableWindowPosition.TOP_CENTER:
                element.style.top = 50 + offsetTop + 'px';
                element.style.left = `calc(50vw - ${ (element.offsetWidth / 2 + offsetLeft) }px)`;
                break;
            case DraggableWindowPosition.CENTER:
                element.style.top = `calc(50vh - ${ (element.offsetHeight / 2) + offsetTop }px)`;
                element.style.left = `calc(50vw - ${ (element.offsetWidth / 2) + offsetLeft }px)`;
                break;
            case DraggableWindowPosition.TOP_LEFT:
                element.style.top = 50 + offsetTop + 'px';
                element.style.left = 50 + offsetLeft + 'px';
                break;
        }

        if (uniqueKey !== null) {
            const memory = POS_MEMORY.get(uniqueKey);
            if (memory) {
                offsetX = memory.x;
                offsetY = memory.y;
            }
        }

        setDelta({ x: 0, y: 0 });
        setOffset({ x: offsetX, y: offsetY });

        return () => {
            const index = CURRENT_WINDOWS.indexOf(element);
            if (index >= 0) CURRENT_WINDOWS.splice(index, 1);
        };
    }, [ handleSelector, windowPosition, uniqueKey, disableDrag, offsetLeft, offsetTop, bringToTop ]);

    useEffect(() => {
        if (!offset && !delta) return;
        const element = elementRef.current;
        if (!element) return;
        element.style.transform = `translate(${ offset.x + delta.x }px, ${ offset.y + delta.y }px)`;
        element.style.visibility = 'visible';
    }, [ offset, delta ]);

    useEffect(() => {
        if (!dragHandler) return;
        dragHandler.addEventListener(MouseEventType.MOUSE_DOWN, onDragMouseDown);
        dragHandler.addEventListener(TouchEventType.TOUCH_START, onTouchDown, { passive: true });

        return () => {
            dragHandler.removeEventListener(MouseEventType.MOUSE_DOWN, onDragMouseDown);
            dragHandler.removeEventListener(TouchEventType.TOUCH_START, onTouchDown);
        };
    }, [ dragHandler, onDragMouseDown, onTouchDown ]);

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
    }, [ isDragging, onDragMouseUp, onDragMouseMove, onDragTouchUp, onDragTouchMove ]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        element.addEventListener('touchstart', onTouchDownHandler, { passive: true });

        return () => {
            element.removeEventListener('touchstart', onTouchDownHandler);
        };
    }, [ onTouchDownHandler ]);

    useEffect(() => {
        if (!uniqueKey) return;
        const localStorage = GetLocalStorage<WindowSaveOptions>(`nitro.windows.${ uniqueKey }`);
        if (!localStorage || !localStorage.offset) return;
        setDelta({ x: 0, y: 0 });
        if (localStorage.offset) setOffset(localStorage.offset);
    }, [ uniqueKey ]);

    return (
        createPortal(
            <Base
                position="absolute"
                innerRef={elementRef}
                className="draggable-window-camera"
                onMouseDownCapture={onMouseDown}
                style={dragStyle}
            >
                {children}
            </Base>,
            document.getElementById('draggable-windows-container')
        )
    );
};