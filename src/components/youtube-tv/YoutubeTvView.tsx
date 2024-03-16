import { FC, useEffect, useMemo, useState } from 'react';
import { AddEventLinkTracker, GetConfiguration, RemoveLinkEventTracker, SendMessageComposer } from '../../api';
import { Button, Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';
import { useMessageEvent } from '../../hooks';

export const YoutubeTvView: FC<{}> = props =>
{
    const [ itemId, setItemId ] = useState<number>(-1);
    const [ videoId, setVideoId ] = useState<string>('');
    const [ videoLink, setVideoLink ] = useState<string>('');
    const [ isVisible, setIsVisible ] = useState<boolean>(false);
    
    const close = () => 
    {
        setIsVisible(false);
    };

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 3) return;
        
                switch(parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        setVideoId(parts[2]);
                        return;
                }
            },
            eventUrlPrefix: 'youtube-tv/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    const origineUrl = useMemo(() => GetConfiguration<string>('url.prefix'), [ ]);

    if(!isVisible) return null;

    return (
        <NitroCardView className="youtube-tv-widget">
            <NitroCardHeaderView headerText={ 'Tv Youtube' } onCloseClick={ close } />
            <NitroCardContentView grow gap={ 0 }>
                <div className="youtube-video-container d-flex w-100 h-100">
                    { (videoId && videoId.length > 0) &&
                        <iframe allowFullScreen={ true } allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" width="100%" height="100%" src={ `https://www.youtube.com/embed/${ videoId }` + '?autoplay=1&mute=0&controls=1&origin=' + origineUrl + '&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&enablejsapi=1&widgetid=3' }></iframe>
                    }
                </div>
            </NitroCardContentView>
        </NitroCardView>
    );
}
