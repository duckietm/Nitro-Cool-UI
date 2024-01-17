import { FC, KeyboardEvent, MouseEvent, useEffect, useState } from 'react';
import { Button, Overlay, Popover } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { GetSessionDataManager, LocalizeText } from '../../../../api';
import { Base, Flex, Grid, NitroCardContentView } from '../../../../common';
import { useChatInputWidget, useMessenger, useSessionInfo } from '../../../../hooks';


export const ChatInputStickersSelectorConsolaView: FC<{}> = props =>
{
    const [ target, setTarget ] = useState<(EventTarget & HTMLElement)>(null);
    const [ selectorVisible, setSelectorVisible ] = useState(false);
    const [ stickers, setStickers ] = useState(null)
    const [ stickersGiphy, setStickersGiphy ] = useState(null)
    const [ showNativeStickers, setShowNativeStickers ] = useState(true)
    const [ showGiphyStickers, setShowGiphyStickers ] = useState(false)
    const { sendChat = null } = useChatInputWidget();
    var evadeClosing = false;
    const { chatStyleId = 0 } = useSessionInfo();
    const { visibleThreads = [], activeThread = null, getMessageThread = null, sendMessage = null, setActiveThreadId = null, closeThread = null } = useMessenger();

    function searchStickers(strSearch)
    {
        evadeClosing = true;
        if(strSearch.length == 0){
            setShowGiphyStickers(false)
            setShowNativeStickers(true)
            return;
        }
        
        fetch('https://api.giphy.com/v1/gifs/search?api_key=4qwMrfzYMYVl1lhhl3wDaVxDNWAzAv6s&q=' + strSearch + '&limit=25&offset=0&rating=g&lang=en')
            .then((response) => response.json())
            .then((result) => 
            {
                setStickersGiphy(result);
                setShowNativeStickers(false)
                setShowGiphyStickers(true)
            })
    }
    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        if(event.key !== 'Enter') return;
        searchStickers(inputText);
    }
    function sendSticker(sticker){
        const stickerArgs = sticker.split(".gif");
        sendMessage(activeThread, GetSessionDataManager().userId, stickerArgs[0]);
    }

    function NativeStickers(){
        if(stickers == null) return null;
        else return(
            <div></div>
        );
    }

    function GiphyStickers(){
        if(stickersGiphy == null) return null;
        else return(
            <Grid columnCount={ 4 } overflow="auto" id="giphyStickers">
                { stickersGiphy.data.map(sticker => (
                    // eslint-disable-next-line react/jsx-key
                    <Base key={ sticker.images.downsized_medium.url}>
                        <img src={ sticker.images.downsized_medium.url } width={ 50 } height={ 50 } className="sticker-img" onClick={ e => sendSticker(sticker.images.fixed_height_small.url) }/>
                    </Base>
                )) }
            </Grid>
        );
    }
    

    const toggleSelector = (event: MouseEvent<HTMLElement>) =>
    {
        if(evadeClosing) return;
        let visible = true;

        setSelectorVisible(prevValue =>
        {
            visible = !prevValue;

            return visible;
        });

        if(visible) setTarget((event.target as (EventTarget & HTMLElement)));
        evadeClosing = false;
    }

    function handleClose(){
        evadeClosing = true;
    }

    var inputText = "";
    function onChangeInput(value){
        inputText = value;
    }

    useEffect(() =>
    {
        if(selectorVisible) return;

        setTarget(null);
    }, [ selectorVisible ]);

    return (
        <>
            <Base pointer className="icon sticker-icon" onClick={ toggleSelector } style={{ display: "inline-block"}}>
                <Overlay show={ selectorVisible } target={ target } placement="top">
                    <Popover className="nitro-chat-sticker-selector-container image-rendering-pixelated">
                        <NitroCardContentView overflow="hidden" className="bg-transparent">
                            <Flex gap={ 1 }>
                                <input onClick={e => handleClose()} onChange={ e => onChangeInput(e.target.value) } onKeyDown={ onKeyDown } type="text" className="form-control form-control-sm" placeholder={ LocalizeText('generic.search') } />
                                <Button variant="success" className="stickers-search-button" onClick={e => searchStickers(inputText)}>
                                    <FaSearch className="fa-icon" />
                                </Button>
                            </Flex>
                            { showNativeStickers ? <NativeStickers /> : null }
                            { showGiphyStickers ? <GiphyStickers /> : null }
                        </NitroCardContentView>
                    </Popover>
                </Overlay>
            </Base>
        </>
    );
}
