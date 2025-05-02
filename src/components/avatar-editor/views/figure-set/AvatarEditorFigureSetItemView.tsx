import { FC, useEffect, useState, useRef } from 'react';
import { AvatarEditorGridPartItem, GetConfiguration } from '../../../../api';
import { LayoutGridItem, LayoutGridItemProps } from '../../../../common';
import { AvatarEditorIcon } from '../AvatarEditorIcon';

export interface AvatarEditorFigureSetItemViewProps extends LayoutGridItemProps
{
    partItem: AvatarEditorGridPartItem;
}

export const AvatarEditorFigureSetItemView: FC<AvatarEditorFigureSetItemViewProps> = props =>
{
    const { partItem = null, children = null, ...rest } = props;
    const [ updateId, setUpdateId ] = useState(-1);
    const [ imageUrl, setImageUrl ] = useState<string | null>(null);
    const [ isValid, setIsValid ] = useState<boolean>(true);
    const isDisposed = useRef(false);
    const retryCount = useRef(0);
    const maxRetries = 1;

    const hcDisabled = GetConfiguration<boolean>('hc.disabled', false);

    const loadPartImage = async () =>
    {
        if(isDisposed.current) return;

        if(!partItem)
        {
            console.warn(`AvatarEditorFigureSetItemView: Part item missing`, partItem);
            setImageUrl(null);
            setIsValid(false);
            return;
        }

        let resolvedImageUrl: string | null = null;

        if(partItem.imageUrl && typeof partItem.imageUrl === 'object' && 'then' in partItem.imageUrl)
        {
            try
            {
                resolvedImageUrl = await partItem.imageUrl;
            }
            catch(error)
            {
                console.warn(`AvatarEditorFigureSetItemView: Failed to resolve imageUrl promise for item ${partItem.id}`, error);
            }
        }
        else if(typeof partItem.imageUrl === 'string')
        {
            resolvedImageUrl = partItem.imageUrl;
        }

        if(!resolvedImageUrl || !resolvedImageUrl.startsWith('data:image/'))
        {
            console.warn(`AvatarEditorFigureSetItemView: Invalid or missing imageUrl for item ${partItem.id}`, { resolvedImageUrl, type: typeof resolvedImageUrl });
            if(retryCount.current < maxRetries)
            {
                retryCount.current += 1;
                console.log(`AvatarEditorFigureSetItemView: Retrying load for item ${partItem.id} (retry: ${retryCount.current}/${maxRetries})`);
                setTimeout(loadPartImage, 1500);
            }
            else
            {
                console.log(`AvatarEditorFigureSetItemView: Max retries reached, skipping item ${partItem.id}`);
                setImageUrl(null);
                setIsValid(false);
            }
            return;
        }

        setImageUrl(resolvedImageUrl);
        setIsValid(true);
        retryCount.current = 0;
    };

    useEffect(() =>
    {
        isDisposed.current = false;
        retryCount.current = 0;
        setIsValid(true);

        loadPartImage();

        const rerender = () =>
        {
            setUpdateId(prevValue => (prevValue + 1));
            loadPartImage();
        };

        partItem.notify = rerender;

        const handleVisibilityChange = () =>
        {
            if(document.visibilityState === 'visible')
            {
                setImageUrl(null);
                setIsValid(true);
                loadPartImage();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () =>
        {
            isDisposed.current = true;
            partItem.notify = null;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [ partItem ]);

    if(!isValid) return null;

    return (
        <div className="avatar-container">
            <LayoutGridItem className={`avatar-parts ${partItem.isSelected ? 'part-selected' : ''}`} itemImage={partItem.isClear ? undefined : imageUrl} {...rest}>
                { !hcDisabled && partItem.isHC && <i className="icon hc-icon position-absolute" /> }
                { partItem.isClear && <AvatarEditorIcon icon="clear" /> }
                { partItem.isSellable && <AvatarEditorIcon icon="sellable" position="absolute" className="end-1 bottom-1" /> }
                { children }
            </LayoutGridItem>
        </div>
    );
};