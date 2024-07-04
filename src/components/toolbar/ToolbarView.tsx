import { CreateLinkEvent, Dispose, DropBounce, EaseOut, GetSessionDataManager, JumpBy, Motions, NitroToolbarAnimateIconEvent, PerkAllowancesMessageEvent, PerkEnum, Queue, Wait } from '@nitrots/nitro-renderer';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useState } from 'react';
import { GetConfigurationValue, MessengerIconState, OpenMessengerChat, VisitDesktop } from '../../api';
import { Base, Flex, LayoutAvatarImageView, LayoutItemCountView } from '../../common';
import { useAchievements, useFriends, useInventoryUnseenTracker, useMessageEvent, useMessenger, useNitroEvent, useSessionInfo } from '../../hooks';
import { ToolbarMeView } from './ToolbarMeView';

export const ToolbarView: FC<{ isInRoom: boolean }> = props =>
{
    const { isInRoom } = props;
    const [ isMeExpanded, setMeExpanded ] = useState(false);
    const [ useGuideTool, setUseGuideTool ] = useState(false);
    const { userFigure = null } = useSessionInfo();
    const { getFullCount = 0 } = useInventoryUnseenTracker();
    const { getTotalUnseen = 0 } = useAchievements();
    const { requests = [] } = useFriends();
    const { iconState = MessengerIconState.HIDDEN } = useMessenger();
    const isMod = GetSessionDataManager().isModerator;
    
    useMessageEvent<PerkAllowancesMessageEvent>(PerkAllowancesMessageEvent, event =>
    {
        const parser = event.getParser();

        setUseGuideTool(parser.isAllowed(PerkEnum.USE_GUIDE_TOOL));
    });

    useNitroEvent<NitroToolbarAnimateIconEvent>(NitroToolbarAnimateIconEvent.ANIMATE_ICON, event =>
    {
        const animationIconToToolbar = (iconName: string, image: HTMLImageElement, x: number, y: number) =>
        {
            const target = (document.body.getElementsByClassName(iconName)[0] as HTMLElement);

            if(!target) return;
            
            image.className = 'toolbar-icon-animation';
            image.style.visibility = 'visible';
            image.style.left = (x + 'px');
            image.style.top = (y + 'px');

            document.body.append(image);

            const targetBounds = target.getBoundingClientRect();
            const imageBounds = image.getBoundingClientRect();

            const left = (imageBounds.x - targetBounds.x);
            const top = (imageBounds.y - targetBounds.y);
            const squared = Math.sqrt(((left * left) + (top * top)));
            const wait = (500 - Math.abs(((((1 / squared) * 100) * 500) * 0.5)));
            const height = 20;

            const motionName = (`ToolbarBouncing[${ iconName }]`);

            if(!Motions.getMotionByTag(motionName))
            {
                Motions.runMotion(new Queue(new Wait((wait + 8)), new DropBounce(target, 400, 12))).tag = motionName;
            }

            const motion = new Queue(new EaseOut(new JumpBy(image, wait, ((targetBounds.x - imageBounds.x) + height), (targetBounds.y - imageBounds.y), 100, 1), 1), new Dispose(image));

            Motions.runMotion(motion);
        }

        animationIconToToolbar('icon-inventory', event.image, event.x, event.y);
    });

    return (
        <>
            <AnimatePresence>
                { isMeExpanded &&
                    <motion.div
                        initial={ { opacity: 0 }}
                        animate={ { opacity: 1 }}
                        exit={ { opacity: 0 }}>
                        <ToolbarMeView useGuideTool={ useGuideTool } unseenAchievementCount={ getTotalUnseen } setMeExpanded={ setMeExpanded } />
                    </motion.div> }
            </AnimatePresence>
            <Flex alignItems="center" justifyContent="between" gap={ 2 } className="nitro-toolbar py-1 px-3">
                <Flex gap={ 2 } alignItems="center" className="widthsizemax">
                    <Flex alignItems="center" gap={ 2 }>
                        <Flex center pointer className={ 'navigation-item item-avatar ' + (isMeExpanded ? 'active ' : '') } onClick={ event =>
                        {
                            setMeExpanded(!isMeExpanded);
                            event.stopPropagation();
                        } }>
                            <LayoutAvatarImageView figure={ userFigure } headOnly={ true } direction={ 2 } position="absolute" />
                            { (getTotalUnseen > 0) &&
                                <LayoutItemCountView count={ getTotalUnseen } /> }
                        </Flex>
                        { isInRoom &&
                            <Base pointer className="navigation-item icon icon-habbo click-box" onClick={ event => VisitDesktop() } /> }
                        { !isInRoom &&
                            <Base pointer className="navigation-item icon icon-house click-box" onClick={ event => CreateLinkEvent('navigator/goto/home') } /> }
                        <Base pointer className="navigation-item icon icon-rooms click-box" onClick={ event => CreateLinkEvent('navigator/toggle') } />
                        { GetConfigurationValue('game.center.enabled') && <Base pointer className="navigation-item icon icon-game click-box" onClick={ event => CreateLinkEvent('games/toggle') } /> }
                        <Base pointer className="navigation-item icon icon-catalog click-box" onClick={ event => CreateLinkEvent('catalog/toggle') } />
                        <Base pointer className="navigation-item icon icon-inventory click-box" onClick={ event => CreateLinkEvent('inventory/toggle') }>
                            { (getFullCount > 0) &&
                                <LayoutItemCountView count={ getFullCount } /> }
                        </Base>
                        { isInRoom &&
                            <Base pointer className="navigation-item icon icon-camera click-box" onClick={ event => CreateLinkEvent('camera/toggle') } /> }
                        { isMod &&
                            <Base pointer className="navigation-item icon icon-modtools click-box" onClick={ event => CreateLinkEvent('mod-tools/toggle') } /> }
                    </Flex>
                    <Flex alignItems="center" id="toolbar-chat-input-container" />
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                    <Flex gap={ 2 }>
                        <Base pointer className="navigation-item icon icon-friendall click-box friendsmovilgen" onClick={ event => CreateLinkEvent('friends/toggle') }>
                            { (requests.length > 0) &&
                                <LayoutItemCountView count={ requests.length } /> }
                        </Base>
                        { ((iconState === MessengerIconState.SHOW) || (iconState === MessengerIconState.UNREAD)) &&
                            <Base pointer className={ `navigation-item icon icon-message click-box mensajesmovilgen ${ (iconState === MessengerIconState.UNREAD) && 'is-unseen' }` } onClick={ event => OpenMessengerChat() } /> }
                    </Flex>
                    <Base id="toolbar-friend-bar-container" className="d-none d-lg-block" />
                </Flex>
            </Flex>
        </>
    );
}
