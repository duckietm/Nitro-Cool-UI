import { IGetImageListener, ImageResult, TextureUtils, Vector3d } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { BaseProps } from '..';
import { GetRoomEngine, ProductTypeEnum } from '../../api';
import { Base } from '../Base';

interface LayoutFurniImageViewProps extends BaseProps<HTMLDivElement>
{
    productType: string;
    productClassId: number;
    direction?: number;
    extraData?: string;
    scale?: number;
}

export const LayoutFurniImageView: FC<LayoutFurniImageViewProps> = props =>
{
    const { productType = 's', productClassId = -1, direction = 2, extraData = '', scale = 1, style = {}, classNames = [], ...rest } = props;
    const [ imageElement, setImageElement ] = useState<HTMLImageElement>(null);

    const getStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        if(imageElement?.src?.length)
        {
            console.log('LayoutFurniImageView: Applying image URL', imageElement.src);
            newStyle.backgroundImage = `url('${ imageElement.src }')`;
            newStyle.width = imageElement.width;
            newStyle.height = imageElement.height;
        }
        else
        {
            console.log('LayoutFurniImageView: No imageElement, skipping style');
        }

        if(scale !== 1)
        {
            newStyle.transform = `scale(${ scale })`;
            if(!(scale % 1)) newStyle.imageRendering = 'pixelated';
        }

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ imageElement, scale, style ]);

    useEffect(() =>
    {
        console.log('LayoutFurniImageView: productType:', productType, 'productClassId:', productClassId, 'direction:', direction, 'extraData:', extraData);

        if(productClassId < 0 || !productType)
        {
            console.warn('LayoutFurniImageView: Invalid productClassId or productType', { productClassId, productType });
            setImageElement(null);
            return;
        }

        let imageResult: ImageResult = null;

        const listener: IGetImageListener = {
            imageReady: async (id, texture, image) =>
            {
                console.log('LayoutFurniImageView: imageReady called', { id, texture, image });

                try
                {
                    if(!image && texture)
                    {
                        image = await TextureUtils.generateImage(texture);
                        console.log('LayoutFurniImageView: Generated image from texture', image?.src);
                    }

                    if(image && image.src && image.src.startsWith('data:image/'))
                    {
                        image.onload = () => {
                            console.log('LayoutFurniImageView: Image loaded', image.src);
                            setImageElement(image);
                        };
                        if(image.complete) {
                            console.log('LayoutFurniImageView: Image already complete', image.src);
                            setImageElement(image);
                        }
                    }
                    else
                    {
                        console.warn('LayoutFurniImageView: Invalid image in imageReady', image);
                        setImageElement(null);
                    }
                }
                catch(error)
                {
                    console.warn('LayoutFurniImageView: Error in imageReady', error);
                    setImageElement(null);
                }
            },
            imageFailed: (id) => {
                console.warn('LayoutFurniImageView: Image fetch failed for id', id);
                setImageElement(null);
            }
        };

        try
        {
            switch(productType.toLowerCase())
            {
                case ProductTypeEnum.FLOOR:
                    console.log('LayoutFurniImageView: Fetching floor furniture image');
                    imageResult = GetRoomEngine().getFurnitureFloorImage(productClassId, new Vector3d(direction), 64, listener, 0, extraData);
                    break;
                case ProductTypeEnum.WALL:
                    console.log('LayoutFurniImageView: Fetching wall furniture image');
                    imageResult = GetRoomEngine().getFurnitureWallImage(productClassId, new Vector3d(direction), 64, listener, 0, extraData);
                    break;
                default:
                    console.warn('LayoutFurniImageView: Unknown productType', productType);
                    setImageElement(null);
                    return;
            }

            if(imageResult)
            {
                const image = imageResult.getImage();
                console.log('LayoutFurniImageView: Immediate imageResult', image?.src);

                if(image && image.src && image.src.startsWith('data:image/'))
                {
                    image.onload = () => {
                        console.log('LayoutFurniImageView: Immediate image loaded', image.src);
                        setImageElement(image);
                    };
                    if(image.complete) {
                        console.log('LayoutFurniImageView: Immediate image already complete', image.src);
                        setImageElement(image);
                    }
                }
            }
            else
            {
                console.warn('LayoutFurniImageView: No imageResult returned');
            }
        }
        catch(error)
        {
            console.warn('LayoutFurniImageView: Error fetching image', error);
            setImageElement(null);
        }
    }, [ productType, productClassId, direction, extraData ]);

    if(!imageElement)
    {
        console.log('LayoutFurniImageView: Skipping render, no imageElement');
        return null;
    }

    return <Base classNames={ [ 'furni-image', ...classNames ] } style={ getStyle } { ...rest } />;
};