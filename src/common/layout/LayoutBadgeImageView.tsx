import { BadgeImageReadyEvent, NitroSprite, TextureUtils } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { GetConfiguration, GetSessionDataManager, LocalizeBadgeDescription, LocalizeBadgeName, LocalizeText } from '../../api';
import { Base, BaseProps } from '../Base';

export interface LayoutBadgeImageViewProps extends BaseProps<HTMLDivElement>
{
    badgeCode: string;
    isGroup?: boolean;
    showInfo?: boolean;
    customTitle?: string;
    isGrayscale?: boolean;
    scale?: number;
}

export const LayoutBadgeImageView: FC<LayoutBadgeImageViewProps> = props =>
{
    const { badgeCode = null, isGroup = false, showInfo = false, customTitle = null, isGrayscale = false, scale = 1, classNames = [], style = {}, children = null, ...rest } = props;
    const [ imageElement, setImageElement ] = useState<HTMLImageElement>(null);

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'badge-image' ];

        if(isGroup) newClassNames.push('group-badge');
        if(isGrayscale) newClassNames.push('grayscale');
        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames, isGroup, isGrayscale ]);

    const getStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        if(imageElement)
        {
            const badgeUrl = isGroup ? imageElement.src : GetConfiguration<string>('badge.asset.url', '').replace('%badgename%', badgeCode.toString());

            newStyle.backgroundImage = `url(${ badgeUrl })`;
            newStyle.width = imageElement.width;
            newStyle.height = imageElement.height;

            if(scale !== 1)
            {
                newStyle.transform = `scale(${ scale })`;
                if(!(scale % 1)) newStyle.imageRendering = 'pixelated';
                newStyle.width = (imageElement.width * scale);
                newStyle.height = (imageElement.height * scale);
            }
        }

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ badgeCode, imageElement, isGroup, scale, style ]);

    useEffect(() =>
    {

        if(!badgeCode || !badgeCode.length)
        {
            console.warn('LayoutBadgeImageView: Invalid or empty badgeCode', badgeCode);
            setImageElement(null);
            return;
        }

        let didSetBadge = false;

        const onBadgeImageReadyEvent = async (event: BadgeImageReadyEvent) =>
        {
            if(event.badgeId !== badgeCode) return;

            try
            {
                const sprite = new NitroSprite(event.image);
                const element = await TextureUtils.generateImage(sprite);

                if(element && element.src && element.src.startsWith('data:image/'))
                {
                    setImageElement(element);
                    didSetBadge = true;
                }
                else
                {
                    console.warn('LayoutBadgeImageView: Invalid badge image (event)', element);
                }
            }
            catch(error)
            {
                console.warn('LayoutBadgeImageView: Error generating badge image (event)', error);
            }

            GetSessionDataManager().events.removeEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);
        };

        GetSessionDataManager().events.addEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);

        const loadBadgeImage = async () =>
        {
            const texture = isGroup ? GetSessionDataManager().getGroupBadgeImage(badgeCode) : GetSessionDataManager().getBadgeImage(badgeCode);

            if(texture && !didSetBadge)
            {
                try
                {
                    const sprite = new NitroSprite(texture);
                    const element = await TextureUtils.generateImage(sprite);

                    if(element && element.src && element.src.startsWith('data:image/'))
                    {
                        setImageElement(element);
                    }
                    else
                    {
                        console.warn('LayoutBadgeImageView: Invalid badge image (direct)', element);
                    }
                }
                catch(error)
                {
                    console.warn('LayoutBadgeImageView: Error generating badge image (direct)', error);
                }
            }
            else
            {
                console.log('LayoutBadgeImageView: No texture found for badge', badgeCode);
            }
        };

        loadBadgeImage();

        return () => GetSessionDataManager().events.removeEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);
    }, [ badgeCode, isGroup ]);

    return (
        <Base classNames={ getClassNames } style={ getStyle } { ...rest }>
            { (showInfo && GetConfiguration<boolean>('badge.descriptions.enabled', true)) &&
                <Base className="badge-information text-black py-1 px-2 small">
                    <div className="fw-bold mb-1">{ isGroup ? customTitle : LocalizeBadgeName(badgeCode) }</div>
                    <div>{ isGroup ? LocalizeText('group.badgepopup.body') : LocalizeBadgeDescription(badgeCode) }</div>
                </Base> }
            { children }
        </Base>
    );
};