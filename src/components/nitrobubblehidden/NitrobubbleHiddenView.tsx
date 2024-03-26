import { AddLinkEventTracker, ILinkEventTracker, RemoveLinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useChatHistory } from '../../hooks';

export const NitrobubbleHiddenView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ searchText, setSearchText ] = useState<string>('');
    const { chatHistory = [] } = useChatHistory();
    const elementRef = useRef<HTMLDivElement>(null);

    const filteredChatHistory = useMemo(() => 
    {
        if (searchText.length === 0) return chatHistory;

        let text = searchText.toLowerCase();

        return chatHistory.filter(entry => ((entry.message && entry.message.toLowerCase().includes(text))) || (entry.name && entry.name.toLowerCase().includes(text)));
    }, [ chatHistory, searchText ]);

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
            eventUrlPrefix: 'nitrobubblehidden/'
        };

        AddLinkEventTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    if(!isVisible) return null;
    var stylecssnew = "<style>.newbubblehe { visibility: hidden !important; }</style>";
    return (
                <div dangerouslySetInnerHTML={ { __html: stylecssnew }} />
    );
}
