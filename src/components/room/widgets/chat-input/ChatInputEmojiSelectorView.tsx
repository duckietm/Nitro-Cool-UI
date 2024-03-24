import { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Base, Flex, Grid, NitroCardContentView } from '../../../../common';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

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
	
	const handleEmojiSelect = (emoji: any) => {
		addChatEmoji(emoji.native);
		setSelectorVisible(false);
	}

	const addEmojiToChat = (emoji: string) => {
    setChatValue(chatValue + emoji);
    setIsTyping(true);
	};
	
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
        <Overlay show={selectorVisible} target={iconRef} placement="top-end">
            <Popover>
				<Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </Popover>
        </Overlay>
    </>
	);
}