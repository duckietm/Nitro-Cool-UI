import { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Base, Flex, Grid, NitroCardContentView } from '../../../../common';
import { emojiList } from './EmojiList';

interface ChatInputEmojiSelectorViewProps
{
    addChatEmoji: (emoji: string) => void;
}

export const ChatInputEmojiSelectorView: FC<ChatInputEmojiSelectorViewProps> = props =>
{
    const { addChatEmoji = null } = props;	
    const [ selectorVisible, setSelectorVisible ] = useState(false);
	const [ target, setTarget ] = useState<(EventTarget & HTMLElement)>(null);
    const iconRef = useRef<HTMLDivElement>(null);
	const componentRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        const className = 'emoji-icon';
        if (componentRef.current && !componentRef.current.contains(event.target as Node) && !(event.target as Element).classList.contains(className)) {
            setSelectorVisible(false);
            document.removeEventListener('mousedown', handleClickOutside as any);
            setTarget(null);
        }
    };

    const selectEmoji = (emoji: string) =>
    {
        addChatEmoji(emoji);
    }

    const toggleSelector = (event: MouseEvent<HTMLElement>) =>
    {
        setSelectorVisible(prevValue => !prevValue);
    }

    useEffect(() =>
    {
        if(selectorVisible) {
            document.addEventListener('mousedown', handleClickOutside as any);
        }
        else {
            setTarget(null);
        }
    }, [ componentRef, selectorVisible ]);

    return (
    <>
        <Base pointer onClick={toggleSelector} innerRef={iconRef}>🙂</Base>
        <Overlay show={selectorVisible} target={iconRef} placement="top">
            <Popover className="nitro-chat-style-selector-container">
                <NitroCardContentView overflow="hidden" className="bg-transparent">
                    <Grid columnCount={4} overflow="auto">
                        {emojiList && emojiList.length > 0 && emojiList.map((emojiId) => {
                            return (
                                <Flex center pointer key={emojiId} onClick={(event) => selectEmoji(emojiId)}>
                                    <Base className="emoji" textColor="black" style={{ fontSize: '20px' }}>{emojiId}</Base>
                                </Flex>
                            );
                        })}
                    </Grid>
                </NitroCardContentView>
            </Popover>
        </Overlay>
    </>
	);
}