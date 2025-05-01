import { SCALE_MODES } from '@pixi/constants';
import { Texture } from '@pixi/core';
import { IsometricImageFurniVisualization } from './IsometricImageFurniVisualization';

export class FurnitureDynamicThumbnailVisualization extends IsometricImageFurniVisualization
{
    private _cachedUrl: string;

    constructor()
    {
        super();

        this._cachedUrl = null;
        this._hasOutline = true;
    }

    protected async updateModel(scale: number): Promise<boolean>
    {
        if (this.object)
        {
            const thumbnailUrl = this.getThumbnailURL();

            if (this._cachedUrl !== thumbnailUrl)
            {
                this._cachedUrl = thumbnailUrl;

                if (this._cachedUrl && this._cachedUrl !== '')
                {
                    const image = new Image();

                    image.src = thumbnailUrl;
                    image.crossOrigin = '*';

                    await new Promise<void>((resolve) => {
                        image.onload = () => {
                            const texture = Texture.from(image);

                            texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

                            this.setThumbnailImages(texture);
                            resolve();
                        };
                        image.onerror = () => {
                            console.warn('FurnitureDynamicThumbnailVisualization: Failed to load thumbnail image', { thumbnailUrl });
                            this.setThumbnailImages(null);
                            resolve();
                        };
                    });
                }
                else
                {
                    this.setThumbnailImages(null);
                }
            }
        }

        return await super.updateModel(scale);
    }

    protected getThumbnailURL(): string
    {
        throw (new Error('This method must be overridden!'));
    }
}