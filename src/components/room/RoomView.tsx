import { GetRenderer, RoomSession } from '@nitrots/nitro-renderer';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useRef } from 'react';
import { DispatchMouseEvent, DispatchTouchEvent } from '../../api';
import { useRoom } from '../../hooks';
import { RoomSpectatorView } from './spectator/RoomSpectatorView';
import { RoomWidgetsView } from './widgets/RoomWidgetsView';

export const RoomView: FC<{}> = props =>
{
    const { roomSession = null } = useRoom();
    const elementRef = useRef<HTMLDivElement>();

    useEffect(() =>
    {
        if(!roomSession) return;

        const canvas = GetRenderer().canvas;

        if(!canvas) return;

        canvas.onclick = event => DispatchMouseEvent(event);
        canvas.onmousemove = event => DispatchMouseEvent(event);
        canvas.onmousedown = event => DispatchMouseEvent(event);
        canvas.onmouseup = event => DispatchMouseEvent(event);

        canvas.ontouchstart = event => DispatchTouchEvent(event);
        canvas.ontouchmove = event => DispatchTouchEvent(event);
        canvas.ontouchend = event => DispatchTouchEvent(event);
        canvas.ontouchcancel = event => DispatchTouchEvent(event);

        const element = elementRef.current;

        if(!element) return;

        element.appendChild(canvas);
    }, [ roomSession ]);

    return (
        <AnimatePresence>
            { !!roomSession &&
                <motion.div
						initial={ { opacity: 0 }}
                    animate={ { opacity: 1 }}
                    exit={ { opacity: 0 }}>
                    <div ref={ elementRef } className="w-100 h-100">
                        { roomSession instanceof RoomSession &&
                            <>
                                <RoomWidgetsView />
                                { roomSession.isSpectator && <RoomSpectatorView /> }
                            </> }
                    </div>
                </motion.div> }
        </AnimatePresence>
    );
};