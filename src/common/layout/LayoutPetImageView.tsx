import { IPetCustomPart, PetFigureData, TextureUtils, Vector3d } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { GetRoomEngine } from '../../api';
import { Base, BaseProps } from '../Base';

interface LayoutPetImageViewProps extends BaseProps<HTMLDivElement>
{
    figure?: string;
    typeId?: number;
    paletteId?: number;
    petColor?: number;
    customParts?: IPetCustomPart[];
    posture?: string;
    headOnly?: boolean;
    direction?: number;
    scale?: number;
    isIcon?: boolean;
}

export const LayoutPetImageView: FC<LayoutPetImageViewProps> = props =>
{
    const { figure = '', typeId = -1, paletteId = -1, petColor = 0xFFFFFF, customParts = [], posture = 'std', headOnly = false, direction = 0, scale = 1, isIcon = false, style = {}, classNames = [], ...rest } = props;
    const [ petUrl, setPetUrl ] = useState<string>(null);
    const [ width, setWidth ] = useState(0);
    const [ height, setHeight ] = useState(0);
    const isDisposed = useRef(false);
    const retryCount = useRef(0);
    const maxRetries = 3;
    const prevFigure = useRef<string>('');

    const getStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        if(petUrl && petUrl.length)
        {
            newStyle.backgroundImage = `url(${ petUrl })`;
            newStyle.width = width;
            newStyle.height = height;
        }

        if(scale !== 1)
        {
            newStyle.transform = `scale(${ scale })`;
            if(!(scale % 1)) newStyle.imageRendering = 'pixelated';
        }

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ petUrl, scale, style, width, height, isIcon ]);

    const fetchPetImage = () =>
    {
        let petTypeId = typeId;
        let petPaletteId = paletteId;
        let petColor1 = petColor;
        let petCustomParts: IPetCustomPart[] = customParts;
        let petHeadOnly = headOnly;

        if(figure && figure.length)
        {
            try
            {
                const petFigureData = new PetFigureData(figure);
                petTypeId = petFigureData.typeId;
                petPaletteId = petFigureData.paletteId;
                petColor1 = petFigureData.color;
                petCustomParts = petFigureData.customParts;
            }
            catch(error)
            {
                console.warn(`LayoutPetImageView: Error parsing PetFigureData (isIcon: ${isIcon})`, error, 'Figure:', figure);
                setPetUrl(null);
                return;
            }
        }

        if(petTypeId === 16) petHeadOnly = false;

        if(petTypeId < 0 || petPaletteId < 0)
        {
            console.warn(`LayoutPetImageView: Invalid petTypeId or petPaletteId (isIcon: ${isIcon})`, { petTypeId, petPaletteId, figure });
            setPetUrl(null);
            return;
        }

        try
        {
            const imageResult = GetRoomEngine().getRoomObjectPetImage(petTypeId, petPaletteId, petColor1, new Vector3d((direction * 45)), isIcon ? 32 : 64, {
                imageReady: async (id, texture, image) =>
                {
                    if(isDisposed.current) return;

                    try
                    {
                        if(image && image.src && image.src.startsWith('data:image/'))
                        {
                            image.onload = () => {
                                setPetUrl(image.src);
                                setWidth(image.width);
                                setHeight(image.height);
                            };
                            if(image.complete)
                            {
                                setPetUrl(image.src);
                                setWidth(image.width);
                                setHeight(image.height);
                            }
                        }
                        else if(texture)
                        {
                            const url = await TextureUtils.generateImageUrl(texture);
                            if(url && url.startsWith('data:image/'))
                            {
                                setPetUrl(url);
                                setWidth(texture.width || (isIcon ? 32 : 64));
                                setHeight(texture.height || (isIcon ? 32 : 64));
                            }
                            else
                            {
                                console.warn(`LayoutPetImageView: Invalid texture URL (isIcon: ${isIcon})`, url);
                                setPetUrl(null);
                            }
                        }
                        else
                        {
                            console.warn(`LayoutPetImageView: No image or texture in imageReady (isIcon: ${isIcon})`, { id });
                            setPetUrl(null);
                        }
                    }
                    catch(error)
                    {
                        console.warn(`LayoutPetImageView: Error in imageReady (isIcon: ${isIcon})`, error, 'ID:', id);
                        setPetUrl(null);
                    }
                },
                imageFailed: (id) =>
                {
                    console.warn(`LayoutPetImageView: Image fetch failed for id (isIcon: ${isIcon})`, id, 'Props:', { petTypeId, petPaletteId, posture });
                    if(retryCount.current < maxRetries)
                    {
                        retryCount.current += 1;
                        console.log(`LayoutPetImageView: Retrying fetch (retry: ${retryCount.current}/${maxRetries})`);
                        setTimeout(fetchPetImage, 1000);
                    }
                    else
                    {
                        setPetUrl(null);
                    }
                }
            }, petHeadOnly, 0, petCustomParts, posture);

            if(imageResult)
            {
                (async () =>
                {
                    const image = await imageResult.getImage();

                    if(image && image.src && image.src.startsWith('data:image/'))
                    {
                        image.onload = () => {
                            setPetUrl(image.src);
                            setWidth(image.width);
                            setHeight(image.height);
                        };
                        if(image.complete)
                        {
                            setPetUrl(image.src);
                            setWidth(image.width);
                            setHeight(image.height);
                        }
                    }
                })();
            }
            else
            {
                if(retryCount.current < maxRetries)
                {
                    retryCount.current += 1;
                    console.log(`LayoutPetImageView: Retrying fetch (retry: ${retryCount.current}/${maxRetries})`);
                    setTimeout(fetchPetImage, 1000);
                }
            }
        }
        catch(error)
        {
            if(retryCount.current < maxRetries)
            {
                retryCount.current += 1;
                console.log(`LayoutPetImageView: Retrying fetch (retry: ${retryCount.current}/${maxRetries})`);
                setTimeout(fetchPetImage, 1000);
            }
            else
            {
                setPetUrl(null);
            }
        }
    };

    useEffect(() =>
    {
        isDisposed.current = false;
        retryCount.current = 0;

        // Force reload if figure changes
        const figureChanged = prevFigure.current !== figure;
        if(figureChanged)
        {
            setPetUrl(null);
            prevFigure.current = figure;
        }

        fetchPetImage();

        // Handle visibility changes
        const handleVisibilityChange = () =>
        {
            if(document.visibilityState === 'visible')
            {
                setPetUrl(null); // Reset to force reload
                fetchPetImage();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () =>
        {
            isDisposed.current = true;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [ figure, typeId, paletteId, petColor, customParts, posture, headOnly, direction, isIcon ]);

    return <Base classNames={ [ 'pet-image', isIcon ? 'pet-icon' : '', ...classNames ] } style={ getStyle } { ...rest } />;
};