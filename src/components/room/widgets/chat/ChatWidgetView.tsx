import { RoomChatSettings } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useRef } from 'react';
import { ChatBubbleMessage, DoChatsOverlap, GetConfiguration } from '../../../../api';
import { useChatWidget } from '../../../../hooks';
import IntervalWebWorker from '../../../../workers/IntervalWebWorker';
import { WorkerBuilder } from '../../../../workers/WorkerBuilder';
import { ChatWidgetMessageView } from './ChatWidgetMessageView';

export const ChatWidgetView: FC<{}> = props => {
    const { chatMessages = [], setChatMessages = null, chatSettings = null, getScrollSpeed = 6000 } = useChatWidget();
    const elementRef = useRef<HTMLDivElement>();
    const lastTickTimeRef = useRef<number>(Date.now());
    const scrollAmountPerTick = 15; // Pixels moved per tick
    const workerRef = useRef<Worker | null>(null); // Preserve worker across re-renders

    const removeHiddenChats = useCallback(() => {
        setChatMessages(prevValue => {
            if (prevValue) {
                const newMessages = prevValue.filter(chat => ((chat.top > (-(chat.height) * 2))));
                if (newMessages.length !== prevValue.length) return newMessages;
            }
            return prevValue;
        });
    }, [setChatMessages]);

    const checkOverlappingChats = useCallback((chat: ChatBubbleMessage, moved: number, tempChats: ChatBubbleMessage[]) => {
        for (let i = (chatMessages.indexOf(chat) - 1); i >= 0; i--) {
            const collides = chatMessages[i];
            if (!collides || (chat === collides) || (tempChats.indexOf(collides) >= 0) || (((collides.top + collides.height) - moved) > (chat.top + chat.height))) continue;

            if (DoChatsOverlap(chat, collides, -moved, 0)) {
                const amount = Math.abs((collides.top + collides.height) - chat.top);
                tempChats.push(collides);
                collides.top -= amount;
                checkOverlappingChats(collides, amount, tempChats);
            }
        }
    }, [chatMessages]);

    const makeRoom = useCallback((chat: ChatBubbleMessage) => {
        if (chatSettings.mode === RoomChatSettings.CHAT_MODE_FREE_FLOW) {
            checkOverlappingChats(chat, 0, [chat]);
            removeHiddenChats();
        } else {
            const lowestPoint = (chat.top + chat.height);
            const requiredSpace = chat.height;
            const spaceAvailable = (elementRef.current.offsetHeight - lowestPoint);
            const amount = (requiredSpace - spaceAvailable);

            if (spaceAvailable < requiredSpace) {
                setChatMessages(prevValue => {
                    prevValue.forEach(prevChat => {
                        prevChat.top -= amount;
                        if (prevChat.elementRef) {
                            prevChat.elementRef.style.top = `${prevChat.top}px`;
                        }
                    });
                    return prevValue;
                });
                removeHiddenChats();
            }
        }
    }, [chatSettings, checkOverlappingChats, removeHiddenChats, setChatMessages]);

    const moveAllChatsUp = useCallback((amount: number) => {
        setChatMessages(prevValue => {
            prevValue.forEach(chat => {
                chat.top -= amount;
                if (chat.elementRef) {
                    chat.elementRef.style.top = `${chat.top}px`;
                }
            });
            return prevValue;
        });
        removeHiddenChats();
        lastTickTimeRef.current = Date.now();
    }, [setChatMessages, removeHiddenChats]);

    useEffect(() => {
        const resize = (event: UIEvent = null) => {
            if (!elementRef || !elementRef.current) return;

            const currentHeight = elementRef.current.offsetHeight;
            const newHeight = Math.round(document.body.offsetHeight * GetConfiguration<number>('chat.viewer.height.percentage'));

            elementRef.current.style.height = `${newHeight}px`;

            setChatMessages(prevValue => {
                if (prevValue) {
                    prevValue.forEach(chat => {
                        chat.top -= (currentHeight - newHeight);
                        if (chat.elementRef) {
                            chat.elementRef.style.top = `${chat.top}px`;
                        }
                    });
                }
                return prevValue;
            });
        };

        window.addEventListener('resize', resize);
        resize();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [setChatMessages]);

    useEffect(() => {
        const worker = new WorkerBuilder(IntervalWebWorker);
        workerRef.current = worker;
        worker.onmessage = () => moveAllChatsUp(scrollAmountPerTick);
        worker.postMessage({ action: 'START', content: getScrollSpeed });

        return () => {
            if (workerRef.current) {
                workerRef.current.postMessage({ action: 'STOP' });
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [moveAllChatsUp]); // Remove getScrollSpeed from deps to prevent re-creation

    // Update worker interval if getScrollSpeed changes
    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ action: 'UPDATE', content: getScrollSpeed });
        }
    }, [getScrollSpeed]);

    // Handle new chats and ensure immediate scrolling
    useEffect(() => {
        if (!chatMessages.length) return;

        const lastChat = chatMessages[chatMessages.length - 1];
        const timeSinceLastTick = Date.now() - lastTickTimeRef.current;
        const ticksMissed = Math.floor(timeSinceLastTick / getScrollSpeed);
        const offset = ticksMissed * scrollAmountPerTick;

        setChatMessages(prevValue => {
            const newChat = prevValue[prevValue.length - 1];
            if (newChat === lastChat) {
                newChat.top -= offset;
                if (newChat.elementRef) {
                    newChat.elementRef.style.top = `${newChat.top}px`;
                }
            }
            return prevValue;
        });

        moveAllChatsUp(scrollAmountPerTick);
    }, [chatMessages, getScrollSpeed, moveAllChatsUp]);

    return (
        <div ref={elementRef} className="nitro-chat-widget">
            {chatMessages.map(chat => (
                <ChatWidgetMessageView
                    key={chat.id}
                    chat={chat}
                    makeRoom={makeRoom}
                    bubbleWidth={chatSettings.weight}
                />
            ))}
        </div>
    );
};