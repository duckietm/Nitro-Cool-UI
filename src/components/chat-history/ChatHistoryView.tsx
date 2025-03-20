import { AddLinkEventTracker, ILinkEventTracker, RemoveLinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ChatEntryType, LocalizeText } from '../../api';
import { Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../common';
import { useChatHistory } from '../../hooks';
import { NitroInput } from '../../layout';

export const ChatHistoryView: FC<{}> = props => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const {chatHistory = []} = useChatHistory();
    const elementRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);
    const prevChatLength = useRef<number>(0);

    const filteredChatHistory = useMemo(() => {
        let result = chatHistory;
        
        if (searchText.length > 0) {
            const text = searchText.toLowerCase();
            result = chatHistory.filter(entry => 
                (entry.message && entry.message.toLowerCase().includes(text)) || 
                (entry.name && entry.name.toLowerCase().includes(text))
            );
        }
        
        return [...result];
    }, [chatHistory, searchText]);

    useEffect(() => {
        if (!elementRef.current || !isVisible) return;

        const element = elementRef.current;
        const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
        const isAtBottom = maxScrollTop === 0 || Math.abs(element.scrollTop - maxScrollTop) <= 50;

        if (isFirstRender.current) {
            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
            isFirstRender.current = false;
        } else if (filteredChatHistory.length > prevChatLength.current) {
            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
        }

        prevChatLength.current = filteredChatHistory.length;
    }, [filteredChatHistory, isVisible]);

    useEffect(() => {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) => {
                const parts = url.split('/');

                if (parts.length < 2) return;

                switch (parts[1]) {
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

        AddLinkEventTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    if (!isVisible) return null;

    return (
        <NitroCardView className="nitro-chat-history" theme="primary-slim" uniqueKey="chat-history">
            <NitroCardHeaderView headerText={LocalizeText('room.chathistory.button.text')} onCloseClick={event => setIsVisible(false)} />
            <NitroCardContentView className="nitro-card-content" gap={2} overflow="hidden" style={{ height: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column' }}>
                <NitroInput placeholder={LocalizeText('generic.search')} type="text" value={searchText} onChange={event => setSearchText(event.target.value)} />
                <div ref={elementRef} style={{ flex: 1, overflowY: 'auto', background: 'inherit' }}>
                    {filteredChatHistory.map((row, index) => (
                        <Flex key={index} alignItems="center" className="p-1" gap={2}>
                            <Text variant="gray">{row.timestamp}</Text>
                            {row.type === ChatEntryType.TYPE_CHAT && (
                                <div className="bubble-container" style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
                                    <div 
                                        className={`chat-bubble bubble-${row.style} type-${row.chatType}`} 
                                        style={{ maxWidth: '100%', backgroundColor: row.style === 0 ? row.color : 'transparent', position: 'relative', zIndex: 1 }}>
                                        <div className="user-container">
                                            {row.imageUrl && row.imageUrl.length > 0 && (
                                                <div className="user-image" style={{backgroundImage: `url(${row.imageUrl})`}} />
                                            )}
                                        </div>
                                        <div className="chat-content">
                                            <b className="mr-1 username" dangerouslySetInnerHTML={{__html: `${row.name}: `}} />
                                            <span className="message" dangerouslySetInnerHTML={{__html: `${row.message}`}} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {row.type === ChatEntryType.TYPE_ROOM_INFO && (
                                <>
                                    <i className="nitro-icon icon-small-room" />
                                    <Text grow textBreak wrap>{row.name}</Text>
                                </>
                            )}
                        </Flex>
                    ))}
                </div>
            </NitroCardContentView>
        </NitroCardView>
    );
};