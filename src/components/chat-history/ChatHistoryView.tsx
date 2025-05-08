import { ILinkEventTracker, RoomObjectType } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AddEventLinkTracker, ChatEntryType, LocalizeText, RemoveLinkEventTracker } from '../../api';
import { Column, Flex, InfiniteScroll, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text, Button } from '../../common';
import { useChatHistory, useOnClickChat } from '../../hooks';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatHistoryView: FC<{}> = props =>
{
    const { chatHistory = [], clearChatHistory } = useChatHistory();
    const [ isVisible, setIsVisible ] = useState(false);
    const { onClickChat = null } = useOnClickChat();
    const [ searchText, setSearchText ] = useState<string>('');

    const elementRef = useRef<HTMLDivElement>(null);

    const filteredChatHistory = useMemo(() =>
    {
        if (searchText.length === 0) return chatHistory;

        let text = searchText.toLowerCase();

        return chatHistory.filter(entry => ((entry.message && entry.message.toLowerCase().includes(text))) || (entry.name && entry.name.toLowerCase().includes(text)));
    }, [ chatHistory, searchText ]);

    const handleClearHistory = () =>
    {
        if (clearChatHistory) {
            clearChatHistory();
        }
    };

    useEffect(() =>
    {
        if(elementRef && elementRef.current && isVisible) elementRef.current.scrollTop = elementRef.current.scrollHeight;
    }, [ isVisible ]);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'chat-history/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    return (
        <AnimatePresence>
            { isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Flex gap={2} className="nitro-chat-history">
                        <Column className="chat-history-content h-100">
                            <Column className="h-100">
                                <Flex justifyContent="end" className="p-2">
                                    <Button variant="danger" onClick={handleClearHistory}>
                                        {LocalizeText('chat.history.clear')}
                                    </Button>
                                </Flex>
                                <InfiniteScroll
                                    rows={filteredChatHistory}
                                    scrollToBottom={true}
                                    rowRender={row =>
                                    {
                                        // Define styles where imageUrl should not be loaded
                                        const stylesWithoutImage = [1, 2, 8, 28, 30, 32, 33, 34, 35, 36, 38];
                                        const shouldDisplayImage = !stylesWithoutImage.includes(row.style);

                                        // Determine image dimensions and positioning based on entityType
                                        const isPet = row.entityType === RoomObjectType.PET;
                                        const imageWidth = isPet ? '41px' : '90px';  // Double for users to account for transform: scale(0.5)
                                        const imageHeight = isPet ? '54px' : '130px'; // Double for users to account for transform: scale(0.5)
                                        const imageTop = isPet ? '-15px' : '-50px';  // Adjusted to shift user image up
                                        const imageLeft = isPet ? '-9.25px' : '-31px'; // Adjusted to shift user image left

                                        return (
                                            <Flex alignItems="center" className="p-1" gap={2}>
                                                <Text variant="muted">{row.timestamp}</Text>
                                                { (row.type === ChatEntryType.TYPE_CHAT) &&
                                            <div className="bubble-container" style={{ position: 'relative' }}>
                                                { (row.style === 0) &&
                                                <div className="user-container-bg" style={{ backgroundColor: row.color }} /> }
                                                <div className={`chat-bubble bubble-${row.style} type-${row.chatType}`} style={{ maxWidth: '100%' }}>
                                                    <div className="user-container">
                                                        { shouldDisplayImage && row.imageUrl && (row.imageUrl.length > 0) &&
                                                    <div
                                                        className="user-image"
                                                        style={{
                                                            backgroundImage: `url(${row.imageUrl})`,
                                                            width: imageWidth,
                                                            height: imageHeight,
                                                            top: imageTop,
                                                            left: imageLeft,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                        }}
                                                    /> }
                                                    </div>
                                                    <div className="chat-content">
                                                        <b className="username mr-1" dangerouslySetInnerHTML={{ __html: `${row.name}: ` }} />
                                                        <span className="message" style={{ color: row.chatColours }} dangerouslySetInnerHTML={{ __html: `${row.message}` }} onClick={e => onClickChat(e)} />
                                                    </div>
                                                </div>
                                            </div> }
                                                { (row.type === ChatEntryType.TYPE_ROOM_INFO) &&
                                            <>
                                                <i className="icon icon-small-room" />
                                                <Text textBreak wrap grow variant="white">{row.name}</Text>
                                            </> }
                                            </Flex>
                                        )
                                    }}
                                />
                            </Column>
                        </Column>
                        <Flex className="chat-toggle" onClick={event => setIsVisible(false)} />
                    </Flex>
                </motion.div>
            )}
        </AnimatePresence>
    );
};