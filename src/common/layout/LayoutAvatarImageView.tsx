import { AvatarScaleType, AvatarSetType } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { GetAvatarRenderManager } from '../../api';
import { Base, BaseProps } from '../Base';

// Cache for avatar image URLs
const AVATAR_IMAGE_CACHE: Map<string, { url: string }> = new Map();

export interface LayoutAvatarImageViewProps extends BaseProps<HTMLDivElement>
{
    figure: string;
    gender?: string;
    headOnly?: boolean;
    direction?: number;
    scale?: number;
}

export const LayoutAvatarImageView: FC<LayoutAvatarImageViewProps> = props =>
{
    const { figure = '', gender = 'M', headOnly = false, direction = 0, scale = 1, classNames = [], style = {}, ...rest } = props;
    const [ avatarUrl, setAvatarUrl ] = useState<string | null>(null);
    const [ isReady, setIsReady ] = useState<boolean>(false);
    const isDisposed = useRef(false);
    const retryCount = useRef(0);
    const maxRetries = 3;
    const elementRef = useRef<HTMLDivElement>(null);

    const figureKey = useMemo(() => [ figure, gender, direction, headOnly ].join('-'), [ figure, gender, direction, headOnly ]);

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'avatar-image' ];

        if(headOnly) newClassNames.push('head-only');

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames, headOnly ]);

    const getStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        if(avatarUrl && avatarUrl.length)
        {
            newStyle.backgroundImage = `url('${ avatarUrl }')`;
        }

        newStyle.backgroundRepeat = 'no-repeat';
        newStyle.backgroundPosition = headOnly ? 'center -8px' : 'center';
        newStyle.position = 'relative';

        if(scale !== 1)
        {
            newStyle.transform = `scale(${ scale })`;
            if(!(scale % 1)) newStyle.imageRendering = 'pixelated';
        }

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ avatarUrl, scale, style, headOnly ]);

    const loadAvatarImage = async () =>
    {
        if(isDisposed.current) return;

        if(!figure || figure.length === 0)
        {
             setAvatarUrl(null);
            return;
        }

        const cached = AVATAR_IMAGE_CACHE.get(figureKey);
        if(cached)
        {
            setAvatarUrl(cached.url);
            retryCount.current = 0;
            return;
        }

        const avatarImage = GetAvatarRenderManager().createAvatarImage(figure, AvatarScaleType.LARGE, gender, {
            resetFigure: figure =>
            {
                if(isDisposed.current) return;
                loadAvatarImage();
            },
            dispose: () => {},
            disposed: false
        }, null);

        if(!avatarImage)
        {
            if(retryCount.current < maxRetries)
            {
                retryCount.current += 1;
                setTimeout(loadAvatarImage, 1000);
            }
            else
            {
                setAvatarUrl(null);
            }
            return;
        }

        try
        {
            const setType = headOnly ? AvatarSetType.HEAD : AvatarSetType.FULL;
            avatarImage.setDirection(setType, direction);

            const image = await avatarImage.getCroppedImage(setType);

            if(isDisposed.current) return;

            if(image && image.src && typeof image.src === 'string' && image.src.startsWith('data:image/'))
            {
                setAvatarUrl(image.src);
                AVATAR_IMAGE_CACHE.set(figureKey, { url: image.src });
                retryCount.current = 0;
            }
            else
            {
                if(retryCount.current < maxRetries)
                {
                    retryCount.current += 1;
                    setTimeout(loadAvatarImage, 1000);
                }
                else
                {
                    setAvatarUrl(null);
                }
            }
        }
        catch(error)
        {
            console.warn(`LayoutAvatarImageView: Error loading avatar image`, error);
            if(retryCount.current < maxRetries)
            {
                retryCount.current += 1;
                setTimeout(loadAvatarImage, 1000);
            }
            else
            {
                setAvatarUrl(null);
            }
        }
        finally
        {
            setTimeout(() => {
                if(!isDisposed.current) avatarImage.dispose();
            }, 500);
        }
    };

    useEffect(() =>
    {
        isDisposed.current = false;
        retryCount.current = 0;
        setIsReady(true);

        loadAvatarImage();

        const handleVisibilityChange = () =>
        {
            if(document.visibilityState === 'visible')
            {
                setAvatarUrl(null);
                loadAvatarImage();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () =>
        {
            isDisposed.current = true;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [ figure, gender, direction, headOnly, figureKey ]);

    return <Base innerRef={ elementRef } classNames={ getClassNames } style={ getStyle } { ...rest } />;
};