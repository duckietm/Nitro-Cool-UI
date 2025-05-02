import { BadgeImageReadyEvent, NitroSprite, TextureUtils } from '@nitrots/nitro-renderer';
import { createContext, FC, useContext, useEffect, useState } from 'react';
import { GetSessionDataManager } from '../../api';

interface BadgeContextType
{
    badgeImages: Map<string, HTMLImageElement>;
    requestBadge: (badgeCode: string, isGroup: boolean) => Promise<HTMLImageElement>;
    updateBadgeImage: (badgeCode: string, image: HTMLImageElement) => void;
}

const BadgeContext = createContext<BadgeContextType>({
    badgeImages: new Map(),
    requestBadge: async () =>
    {
        console.warn('BadgeContext: Default requestBadge called - BadgeProvider not initialized');
        throw new Error('BadgeProvider not initialized - ensure BadgeProvider is wrapped around the app');
    },
    updateBadgeImage: () =>
    {
        console.warn('BadgeContext: Default updateBadgeImage called - BadgeProvider not initialized');
        throw new Error('BadgeProvider not initialized - ensure BadgeProvider is wrapped around the app');
    },
});

export const BadgeProvider: FC<{}> = ({ children }) =>
{
    const [ badgeImages, setBadgeImages ] = useState<Map<string, HTMLImageElement>>(new Map());

    console.log('BadgeProvider: Initialized');

    const requestBadge = async (badgeCode: string, isGroup: boolean): Promise<HTMLImageElement> =>
    {
        console.log('BadgeProvider: requestBadge called', { badgeCode, isGroup });

        if(!badgeCode || !badgeCode.length)
        {
            console.warn('BadgeProvider: Invalid or empty badgeCode', badgeCode);
            return null;
        }

        // Check if badge is already cached
        const cachedImage = badgeImages.get(badgeCode);
        if(cachedImage)
        {
            console.log('BadgeProvider: Badge loaded from cache', { badgeCode });
            return cachedImage;
        }

        const maxRetries = 3;
        let retryCount = 0;

        while(retryCount < maxRetries)
        {
            try
            {
                console.log('BadgeProvider: Attempting to load badge', { badgeCode, retryCount, isGroup });

                // Check if GetSessionDataManager is ready
                if(!GetSessionDataManager().events)
                {
                    console.warn('BadgeProvider: GetSessionDataManager events not available', { badgeCode, isGroup });
                    return null;
                }

                // Check if badge is already in session data
                let texture = isGroup ? GetSessionDataManager().getGroupBadgeImage(badgeCode) : GetSessionDataManager().getBadgeImage(badgeCode);

                if(!texture)
                {
                    console.log('BadgeProvider: Badge not in cache, requesting', { badgeCode, isGroup });

                    // Create a Promise to wait for the BadgeImageReadyEvent
                    const badgePromise = new Promise<Texture<Resource>>((resolve, reject) =>
                    {
                        console.log('BadgeProvider: Setting up BadgeImageReadyEvent listener', { badgeCode, isGroup });

                        const onBadgeImageReadyEvent = (event: BadgeImageReadyEvent) =>
                        {
                            console.log('BadgeProvider: BadgeImageReadyEvent received', { badgeCode, eventBadgeId: event.badgeId, isGroup });

                            if(event.badgeId === badgeCode)
                            {
                                resolve(event.image);
                                GetSessionDataManager().events.removeEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);
                            }
                        };

                        GetSessionDataManager().events.addEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);

                        // Timeout after 20 seconds to avoid hanging
                        setTimeout(() =>
                        {
                            console.warn('BadgeProvider: Badge loading timed out', { badgeCode, retryCount, isGroup });
                            GetSessionDataManager().events.removeEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);
                            reject(new Error('Badge loading timed out'));
                        }, 20000);
                    });

                    // Request the badge image
                    console.log('BadgeProvider: Requesting badge image', { badgeCode, isGroup });
                    if(isGroup)
                    {
                        GetSessionDataManager().requestGroupBadgeImage(badgeCode);
                    }
                    else
                    {
                        GetSessionDataManager().requestBadgeImage(badgeCode);
                    }

                    // Wait for the badge image to be ready
                    texture = await badgePromise;
                    console.log('BadgeProvider: Badge image received via event', { badgeCode, texture, isGroup });
                }
                else
                {
                    console.log('BadgeProvider: Badge found in session data', { badgeCode, isGroup });
                }

                if(texture)
                {
                    try
                    {
                        console.log('BadgeProvider: Generating image from texture', { badgeCode, isGroup });
                        const sprite = new NitroSprite(texture);
                        const element = await TextureUtils.generateImage(sprite);

                        if(element && element.src && element.src.startsWith('data:image/'))
                        {
                            setBadgeImages(prev =>
                            {
                                const newMap = new Map(prev);
                                newMap.set(badgeCode, element);
                                return newMap;
                            });
                            console.log('BadgeProvider: Badge loaded and cached', { badgeCode, isGroup });
                            return element;
                        }
                        else
                        {
                            console.warn('BadgeProvider: Invalid badge image', { badgeCode, element, isGroup });
                        }
                    }
                    catch(error)
                    {
                        console.warn('BadgeProvider: Error generating badge image', { error: error.message, badgeCode, isGroup });
                    }
                }
                else
                {
                    console.warn('BadgeProvider: Failed to load badge image', { badgeCode, isGroup });
                }
            }
            catch(error)
            {
                console.error('BadgeProvider: Error loading badge', { error: error.message, badgeCode, retryCount, isGroup });
            }

            retryCount++;
            if(retryCount < maxRetries)
            {
                console.log('BadgeProvider: Retrying badge load', { badgeCode, retryCount, isGroup });
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            }
        }

        console.warn('BadgeProvider: Max retries reached, returning null', { badgeCode, maxRetries, isGroup });
        return null;
    };

    const updateBadgeImage = (badgeCode: string, image: HTMLImageElement) =>
    {
        if(!badgeCode || !image) return;

        console.log('BadgeProvider: Updating badge image in context', { badgeCode });

        setBadgeImages(prev =>
        {
            const newMap = new Map(prev);
            newMap.set(badgeCode, image);
            return newMap;
        });
    };

    return (
        <BadgeContext.Provider value={ { badgeImages, requestBadge, updateBadgeImage } }>
            { children }
        </BadgeContext.Provider>
    );
};

export const useBadgeContext = () => {
    const context = useContext(BadgeContext);
    if(!context.requestBadge || !context.updateBadgeImage || context.requestBadge.toString().includes('Default requestBadge')) {
        throw new Error('BadgeContext not initialized - ensure BadgeProvider is wrapped around the app');
    }
    return context;
};