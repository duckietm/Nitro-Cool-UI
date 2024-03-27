import { Resource, Texture } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { IGraphicAsset } from '../../../../../api';
import { NitroSprite, NitroTexture, TextureUtils } from '../../../../../pixi-proxy';
import { FurnitureAnimatedVisualization } from './FurnitureAnimatedVisualization';

export class IsometricImageFurniVisualization extends FurnitureAnimatedVisualization
{
    protected static THUMBNAIL: string = 'THUMBNAIL';

    private _thumbnailAssetNameNormal: string;
    private _thumbnailImageNormal: Texture<Resource>;
    private _thumbnailDirection: number;
    private _thumbnailChanged: boolean;
    protected _hasOutline: boolean;

    constructor()
    {
        super();

        this._thumbnailAssetNameNormal = null;
        this._thumbnailImageNormal = null;
        this._thumbnailDirection = -1;
        this._thumbnailChanged = false;
        this._hasOutline = false;
    }

    public get hasThumbnailImage(): boolean
    {
        return !(this._thumbnailImageNormal == null);
    }

    public setThumbnailImages(texture: Texture<Resource>): void
    {
        this._thumbnailImageNormal = texture;
        this._thumbnailChanged = true;
    }

    protected updateModel(scale: number): boolean
    {
        const flag = super.updateModel(scale);

        if(!this._thumbnailChanged && (this._thumbnailDirection === this.direction)) return flag;

        this.refreshThumbnail();

        return true;
    }

    private refreshThumbnail(): void
    {
        if(this.asset == null) return;

        if(this._thumbnailImageNormal)
        {
            this.addThumbnailAsset(this._thumbnailImageNormal, 64);
        }
        else
        {
            this.asset.disposeAsset(this.getThumbnailAssetName(64));
        }

        this._thumbnailChanged = false;
        this._thumbnailDirection = this.direction;
    }

    private addThumbnailAsset(texture: Texture<Resource>, scale: number): void
    {
        let layerId = 0;

        while(layerId < this.totalSprites)
        {
            if(this.getLayerTag(scale, this.direction, layerId) === IsometricImageFurniVisualization.THUMBNAIL)
            {
                const assetName = (this.cacheSpriteAssetName(scale, layerId, false) + this.getFrameNumber(scale, layerId));
                const asset = this.getAsset(assetName, layerId);

                if(asset)
                {
                    const _local_6 = this.generateTransformedThumbnail(texture, asset);
                    const _local_7 = this.getThumbnailAssetName(scale);

                    this.asset.disposeAsset(_local_7);
                    this.asset.addAsset(_local_7, _local_6, true, asset.offsetX, asset.offsetY, false, false);
                }

                return;
            }

            layerId++;
        }
    }

    protected generateTransformedThumbnail(texture: Texture<Resource>, asset: IGraphicAsset): Texture<Resource>
    {
        if(this._hasOutline)
        {
            const container = new NitroSprite();
            const background = new NitroSprite(NitroTexture.WHITE);

            background.tint = 0x000000;
            background.width = (texture.width + 40);
            background.height = (texture.height + 40);

            const sprite = new NitroSprite(texture);
            const offsetX = ((background.width - sprite.width) / 2);
            const offsetY = ((background.height - sprite.height) / 2);

            sprite.position.set(offsetX, offsetY);

            container.addChild(background, sprite);

            texture = TextureUtils.generateTexture(container);
        }

        texture.orig.width = asset.width;
        texture.orig.height = asset.height;

        const matrix = new Matrix();

        switch(this.direction)
        {
            case 2:
                matrix.b = -(0.5);
                matrix.d /= 1.6;
                matrix.ty = ((0.5) * texture.width);
                break;
            case 0:
            case 4:
                matrix.b = (0.5);
                matrix.d /= 1.6;
                matrix.tx = -0.5;
                break;
        }

        const sprite = new NitroSprite(texture);

        sprite.transform.setFromMatrix(matrix);

        return TextureUtils.generateTexture(sprite);
    }

    protected getSpriteAssetName(scale: number, layerId: number): string
    {
        if(this._thumbnailImageNormal && (this.getLayerTag(scale, this.direction, layerId) === IsometricImageFurniVisualization.THUMBNAIL)) return this.getThumbnailAssetName(scale);

        return super.getSpriteAssetName(scale, layerId);
    }

    protected getThumbnailAssetName(scale: number): string
    {
        this._thumbnailAssetNameNormal = this.getFullThumbnailAssetName(this.object.id, 64);

        return this._thumbnailAssetNameNormal;
    }

    protected getFullThumbnailAssetName(k: number, _arg_2: number): string
    {
        return [this._type, k, 'thumb', _arg_2].join('_');
    }
}
