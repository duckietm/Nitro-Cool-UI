import { FindNewFriendsMessageComposer, MouseEventType } from '@nitrots/nitro-renderer';
import { FC, useEffect, useRef, useState } from 'react';
import { GetUserProfile, LocalizeText, MessengerFriend, OpenMessengerChat, SendMessageComposer } from '../../../../api';
import { Base, Button, LayoutAvatarImageView } from '../../../../common';
import { useFriends } from '../../../../hooks';

export const FriendBarItemView: FC<{ friend: MessengerFriend }> = props =>
{
    const { friend = null } = props;
    const [ isVisible, setVisible ] = useState(false);
    const { followFriend = null } = useFriends();
    const elementRef = useRef<HTMLDivElement>();

    useEffect(() =>
    {
        const onClick = (event: MouseEvent) =>
        {
            const element = elementRef.current;

            if(!element) return;

            if((event.target !== element) && !element.contains((event.target as Node)))
            {
                setVisible(false);
            }
        }

        document.addEventListener(MouseEventType.MOUSE_CLICK, onClick);

        return () => document.removeEventListener(MouseEventType.MOUSE_CLICK, onClick);
    }, []);

    if(!friend)
    {
        return (
            <div ref={ elementRef } className={ 'btn btn-friendsgen friend-bar-item friend-bar-search ' + (isVisible ? 'friend-bar-search-item-active' : '') } onClick={ event => setVisible(prevValue => !prevValue) }>
                <div className="friend-bar-item-head position-absolute"/>
                <div className="friend-bar-text">{ LocalizeText('friend.bar.find.title') }</div>
                { isVisible &&
                    <div className="search-content mt-3">
                        <div className="bg-white text-black px-1 py-1 font-size-friend">{ LocalizeText('friend.bar.find.text') }</div>
                        <Button className="mt-2 mb-4" variant="white" onClick={ () => SendMessageComposer(new FindNewFriendsMessageComposer()) }>{ LocalizeText('friend.bar.find.button') }</Button>
                    </div>
                }
            </div>
        );
    }

    return (
        <div ref={ elementRef } className={ 'btn btn-friendsgensuccess friend-bar-item ' + (isVisible ? 'friend-bar-item-active' : '') } onClick={ event => setVisible(prevValue => !prevValue) }>
            <div className={ `friend-bar-item-head position-absolute ${ friend.id > 0 ? 'avatar': 'group' }` }>
                { (friend.id > 0) && <LayoutAvatarImageView headOnly={ !isVisible } figure={ friend.figure } direction={ isVisible ? 2 : 3 } /> }
                { (friend.id <= 0) && <LayoutAvatarImageView headOnly={ !isVisible } figure={
                    (friend.id <= 0 && friend.figure === 'ADM') ? 'ha-3409-1413-70.lg-285-89.ch-3032-1334-109.sh-3016-110.hd-185-1359.ca-3225-110-62.wa-3264-62-62.fa-1206-90.hr-3322-1403' : friend.figure
                    } isgroup={friend.id <= 0 ? 1 : 0} direction={isVisible ? 2 : 3} /> }
            </div>
            
            <div className="text-truncate">{ friend.name }</div>
            { isVisible &&
            <div className="d-flex justify-content-between">
                <Base className="nitro-friends-spritesheet icon-friendbar-chat cursor-pointer" onClick={ event => OpenMessengerChat(friend.id) } />
                { friend.followingAllowed &&
                <Base className="nitro-friends-spritesheet icon-friendbar-visit cursor-pointer" onClick={ event => followFriend(friend) } /> }
                <Base className="nitro-friends-spritesheet icon-profile cursor-pointer" onClick={ event => GetUserProfile(friend.id) } />
            </div> }
        </div>
    );
}