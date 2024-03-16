import { useBetween } from 'use-between';
import { CreateLinkEvent, LocalizeText } from '../api';
import { useNotification } from './notification';

const useOnClickChatState = () =>
{
    const { showConfirm = null } = useNotification();
  
    const onClickChat = (event: React.MouseEvent<HTMLElement, MouseEvent>) =>
    {
        if (event.target instanceof HTMLAnchorElement && event.target.href) 
        {
            event.stopPropagation();
            event.preventDefault();

            const url = event.target.href;
            if (url.includes('youtube.com') || url.includes('youtu.be'))
            {
                const videoCode = extractVideoCode(url);
                if (videoCode)
                {
                    CreateLinkEvent('youtube-tv/show/' + videoCode)
                }
            }
            else
            {
                showConfirm(LocalizeText('chat.confirm.openurl', [ 'url' ], [ url ]), () =>
                {
                    window.open(url, '_blank');
                },
                null, null, null, LocalizeText('generic.alert.title'), null, 'link');
            }
        }
    }

    const extractVideoCode = (url: string): string | null => 
    {
        const regex = /(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?.*v=|shorts\/)?([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
    
        return match ? match[1] : null;
    }

  
    return { onClickChat }
}

export const useOnClickChat = () => useBetween(useOnClickChatState);
