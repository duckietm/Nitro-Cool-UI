import * as joypixels from 'emoji-toolkit';
import { FC, useMemo } from 'react';
import { GetGroupChatData, GetSessionDataManager, LocalizeText, MessengerGroupType, MessengerThread, MessengerThreadChat, MessengerThreadChatGroup } from '../../../../../api';
import { Base, Flex, LayoutAvatarImageView } from '../../../../../common';

export const FriendsMessengerThreadGroup: FC<{ thread: MessengerThread, group: MessengerThreadChatGroup }> = props =>
{
    const encodeHTML = (str: string) =>
{
    return str.replace(/([\u00A0-\u9999<>&])(.|$)/g, (full, char, next) =>
    {
        if(char !== '&' || next !== '#')
        {
            if(/[\u00A0-\u9999<>&]/.test(next)) next = '&#' + next.charCodeAt(0) + ';';

            return '&#' + char.charCodeAt(0) + ';' + next;
        }

        return full;
    });
}

    const { thread = null, group = null } = props;

    const groupChatData = useMemo(() => ((group.type === MessengerGroupType.GROUP_CHAT) && GetGroupChatData(group.chats[0].extraData)), [ group ]);

    const isOwnChat = useMemo(() =>
    {
        if(!thread || !group) return false;
        
        if((group.type === MessengerGroupType.PRIVATE_CHAT) && (group.userId === GetSessionDataManager().userId)) return true;

        if(groupChatData && group.chats.length && (groupChatData.userId === GetSessionDataManager().userId)) return true;

        return false;
    }, [ thread, group, groupChatData ]);

    if(!thread || !group) return null;
    
    if(!group.userId)
    {
        return (
            <>
                { group.chats.map((chat, index) =>
                {
                    return (
                        <Flex key={ index } fullWidth gap={ 2 } justifyContent="start">
                            <Base className="w-100 text-break">
                                { (chat.type === MessengerThreadChat.SECURITY_NOTIFICATION) &&
                                    <Flex gap={ 2 } alignItems="center" className="bg-light rounded mb-2 px-2 py-1 small text-muted">
                                        <Base className="nitro-friends-spritesheet icon-warning flex-shrink-0" />
                                        <Base>{ chat.message }</Base>
                                    </Flex> }
                                { (chat.type === MessengerThreadChat.ROOM_INVITE) &&
                                    <Flex gap={ 2 } alignItems="center" className="bg-light rounded mb-2 px-2 py-1 small text-black">
                                        <Base className="messenger-notification-icon flex-shrink-0" />
                                        <Base>{ (LocalizeText('messenger.invitation') + ' ') }{ chat.message }</Base>
                                    </Flex> }
                            </Base>
                        </Flex>
                    );
                }) }
            </>
        );
    }
    
    return (
        <Flex fullWidth justifyContent={ isOwnChat ? 'end' : 'start' } gap={ 2 }>
            <Base shrink className="message-avatar">
                { ((group.type === MessengerGroupType.PRIVATE_CHAT) && !isOwnChat) &&
                    <LayoutAvatarImageView figure={ thread.participant.figure } direction={ 2 } /> }
                { (groupChatData && !isOwnChat) &&
                    <LayoutAvatarImageView figure={ groupChatData.figure } direction={ 2 } /> }
            </Base>
            <Base className={ 'bg-light text-black border-radius mb-2 rounded py-1 px-2 messages-group-' + (isOwnChat ? 'right' : 'left') }>
                <div className="fw-bold" dangerouslySetInnerHTML={ { __html: isOwnChat && GetSessionDataManager().userName || !isOwnChat && (groupChatData ? groupChatData.username : thread.participant.name) } } />
                {group.chats.map((chat, index) => {

    let verifscript = chat.message;

    if (verifscript.toLowerCase().includes("<style>"))
    {
        verifscript= "Soy napa, y tengo déficit de atención.";
    }
    if (verifscript.toLowerCase().includes("<script>"))
    {
        verifscript= "Soy napa, y tengo déficit de atención.";
    }

    let message = encodeHTML(verifscript);

    const regex = /\s*\[[^\]]*\]|\s*\([^\)]*\)/g;
    message = (joypixels.shortnameToUnicode(message) as string)

    if (message.includes("https://int.habbeh.net/audios/")) {
        if (message.includes("https://int.habbeh.net/audios/errorpeso")) {
            message = "El audio es demasiado pesado";
        } else {
            message = message.replace(regex, '');
            message = `<audio style='height: 14px; position: relative; top: 2px; width: 195px;' controls src='${message}'/>`;
        }
    } else if (message.includes("giphy.com/media")) {
        message = message.replace(regex, '');
        message = `<p style='background-image: url(${message}.gif); width: 90px; height: 90px; margin: 4px 10px 2px 10px; background-size: cover; border-radius: 3px;'></p>`;
    }

    return (
        <Base
            key={index}
            className="text-break"
            dangerouslySetInnerHTML={{ __html: message }}
        />
    );
})}
            </Base>
            { isOwnChat &&
                <Base shrink className="message-avatar">
                    <LayoutAvatarImageView figure={ GetSessionDataManager().figure } direction={ 4 } />
                </Base> }
        </Flex>
    );
}
