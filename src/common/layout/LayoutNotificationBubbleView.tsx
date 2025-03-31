import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useMemo, useState } from 'react';
import { Flex, FlexProps } from '..';

export interface LayoutNotificationBubbleViewProps extends FlexProps
{
    fadesOut?: boolean;
    timeoutMs?: number;
    onClose: () => void;
}

export const LayoutNotificationBubbleView: FC<LayoutNotificationBubbleViewProps> = props =>
{
    const { fadesOut = true, timeoutMs = 8000, onClose = null, overflow = 'hidden', classNames = [], ...rest } = props;
    const [ isVisible, setIsVisible ] = useState(false);

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'nitro-notification-bubble', 'rounded' ];

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames ]);

    useEffect(() =>
    {
        setIsVisible(true);

        return () => setIsVisible(false);
    }, []);

    useEffect(() =>
    {
        if(!fadesOut) return;

        const timeout = setTimeout(() =>
        {
            setIsVisible(false);

            setTimeout(() => onClose(), 300);
        }, timeoutMs);

        return () => clearTimeout(timeout);
    }, [ fadesOut, timeoutMs, onClose ]);

    return (
        <AnimatePresence>
            { isVisible &&
                <motion.div
                    initial={ { opacity: 0 }}
                    animate={ { opacity: 1 }}
                    exit={ { opacity: 0 }}>
                    <Flex overflow={ overflow } classNames={ getClassNames } onClick={ onClose } { ...rest } />
                </motion.div> }
        </AnimatePresence>
    );
}
