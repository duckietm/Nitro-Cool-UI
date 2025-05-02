import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { GetConfiguration, GetSessionDataManager, LocalizeBadgeDescription, LocalizeBadgeName, LocalizeText } from '../../api';
import { Base, BaseProps } from '../Base';
import { NitroSprite, TextureUtils } from '@nitrots/nitro-renderer';
import { useBadgeContext } from './BadgeContext';

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
    const [ isLoading, setIsLoading ] = useState(true);
    const [ retryCount, setRetryCount ] = useState(0);
    const maxRetries = 5; // Maximum number of retries
    const retryInterval = 2000; // Retry every 2 seconds
    const { badgeImages, requestBadge, updateBadgeImage } = useBadgeContext();

    console.log('LayoutBadgeImageView: Rendered', { badgeCode, isGroup, badgeImagesSize: badgeImages.size });

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

            // Remove inline width and height to let SCSS control the size
            // newStyle.width = imageElement.width;
            // newStyle.height = imageElement.height;

            if(scale !== 1)
            {
                newStyle.transform = `scale(${ scale })`;
                if(!(scale % 1)) newStyle.imageRendering = 'pixelated';
                // If scaling, adjust the dimensions in SCSS instead
            }
        }

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ badgeCode, imageElement, isGroup, scale, style ]);

    useEffect(() =>
    {
        console.log('LayoutBadgeImageView: useEffect triggered', { badgeCode, isGroup, retryCount });

        if(!badgeCode || !badgeCode.length)
        {
            console.warn('LayoutBadgeImageView: Invalid or empty badgeCode', badgeCode);
            setImageElement(null);
            setIsLoading(false);
            return;
        }

        const loadBadgeImage = async () =>
        {
            console.log('LayoutBadgeImageView: loadBadgeImage started', { badgeCode, retryCount, isGroup });

            setIsLoading(true);

            try
            {
                // Check if badge is already in context
                const cachedImage = badgeImages.get(badgeCode);
                if(cachedImage)
                {
                    setImageElement(cachedImage);
                    setIsLoading(false);
                    console.log('LayoutBadgeImageView: Badge loaded from context', { badgeCode, isGroup });
                    return;
                }

                console.log('LayoutBadgeImageView: Requesting badge via context', { badgeCode, isGroup });

                // Request the badge image via the context
                const element = await requestBadge(badgeCode, isGroup);

                if(element)
                {
                    setImageElement(element);
                    console.log('LayoutBadgeImageView: Badge loaded via request', { badgeCode, isGroup });
                }
                else
                {
                    console.warn('LayoutBadgeImageView: Failed to load badge image via context, attempting direct fetch', { badgeCode, isGroup });

                    // Fallback: Try fetching directly from session data
                    let texture = isGroup ? GetSessionDataManager().getGroupBadgeImage(badgeCode) : GetSessionDataManager().getBadgeImage(badgeCode);

                    if(texture)
                    {
                        const sprite = new NitroSprite(texture);
                        const fallbackElement = await TextureUtils.generateImage(sprite);

                        if(fallbackElement && fallbackElement.src && fallbackElement.src.startsWith('data:image/'))
                        {
                            setImageElement(fallbackElement);
                            updateBadgeImage(badgeCode, fallbackElement);
                            console.log('LayoutBadgeImageView: Badge loaded via direct fetch and cached in context', { badgeCode, isGroup });
                        }
                        else
                        {
                            console.warn('LayoutBadgeImageView: Invalid badge image from direct fetch', { badgeCode, isGroup });
                        }
                    }
                    else if(retryCount < maxRetries)
                    {
                        console.log('LayoutBadgeImageView: Retrying badge load', { badgeCode, retryCount, isGroup });
                        setTimeout(() =>
                        {
                            setRetryCount(prev => prev + 1);
                        }, retryInterval);
                        return;
                    }
                    else
                    {
                        console.warn('LayoutBadgeImageView: Max retries reached, failed to load badge', { badgeCode, maxRetries, isGroup });
                    }
                }
            }
            catch(error)
            {
                console.error('LayoutBadgeImageView: Error loading badge', { error: error.message, badgeCode, isGroup });
            }
            finally
            {
                setIsLoading(false);
                console.log('LayoutBadgeImageView: loadBadgeImage completed', { badgeCode, isLoading: false, isGroup });
            }
        };

        loadBadgeImage();
    }, [ badgeCode, isGroup, badgeImages, requestBadge, retryCount, updateBadgeImage ]);

    if(isLoading)
    {
        console.log('LayoutBadgeImageView: Rendering loading state', { badgeCode, isGroup });
        return null; // Optionally render a loading placeholder
    }

    console.log('LayoutBadgeImageView: Rendering badge', { badgeCode, hasImage: !!imageElement, isGroup });

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