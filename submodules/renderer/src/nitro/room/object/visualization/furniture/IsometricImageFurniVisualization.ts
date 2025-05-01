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
    private _uniqueId: string;
    private _photoUrl: string;
    protected _hasOutline: boolean;

    constructor()
    {
        super();

        this._thumbnailAssetNameNormal = null;
        this._thumbnailImageNormal = null;
        this._thumbnailDirection = -1;
        this._thumbnailChanged = false;
        this._uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this._photoUrl = null;
        this._hasOutline = true;
    }

    public get hasThumbnailImage(): boolean
    {
        return !(this._thumbnailImageNormal == null);
    }

    public setThumbnailImages(k: Texture<Resource>, url?: string): void
    {
        this._thumbnailImageNormal = k;
        this._photoUrl = url || null;
        this._thumbnailChanged = true;
    }

    public getPhotoUrl(): string
    {
        return this._photoUrl;
    }

    protected async updateModel(scale: number): Promise<boolean>
    {
        const flag = await super.updateModel(scale);

        if (!this._thumbnailChanged && (this._thumbnailDirection === this.direction)) {
            return flag;
        }

        await this.refreshThumbnail();

        return true;
    }

    private async refreshThumbnail(): Promise<void>
    {
        if (this.asset == null) {
            return;
        }

        const thumbnailAssetName = this.getThumbnailAssetName(64);

        if (this._thumbnailImageNormal) {
            await this.addThumbnailAsset(this._thumbnailImageNormal, 64);
        } else {
            const layerId = 2;
            const sprite = this.getSprite(layerId);
        }

        this._thumbnailChanged = false;
        this._thumbnailDirection = this.direction;
    }

    private async addThumbnailAsset(k: Texture<Resource>, scale: number): Promise<void>
    {
        let layerId = 0;

        while (layerId < this.totalSprites)
        {
            const layerTag = this.getLayerTag(scale, this.direction, layerId);

            if (layerTag === IsometricImageFurniVisualization.THUMBNAIL)
            {
                const assetName = (this.cacheSpriteAssetName(scale, layerId, false) + this.getFrameNumber(scale, layerId));
                const asset = this.getAsset(assetName, layerId);
                const thumbnailAssetName = `${this.getThumbnailAssetName(scale)}-${this._uniqueId}`;
                const transformedTexture = await this.generateTransformedThumbnail(k, asset || { width: 64, height: 64, offsetX: 0, offsetY: 0 });

                if (!transformedTexture) {
                    console.warn('IsometricImageFurniVisualization: Failed to generate transformed thumbnail for asset', { assetName });
                    return;
                }

                const baseOffsetX = asset?.offsetX || 0;
                const baseOffsetY = asset?.offsetY || 0;

                const offsetX = baseOffsetX - (transformedTexture.width / 2);
                const offsetY = baseOffsetY - (transformedTexture.height / 2);

                this.asset.addAsset(thumbnailAssetName, transformedTexture, true, offsetX, offsetY, false, false);

                const sprite = this.getSprite(layerId);
                if (sprite) {
                    sprite.texture = transformedTexture;
                } else {
                    console.warn('IsometricImageFurniVisualization: Sprite not found for layer', { layerId });
                }

                return;
            }

            layerId++;
        }
    }

    protected async generateTransformedThumbnail(texture: Texture<Resource>, asset: IGraphicAsset): Promise<Texture<Resource>>
    {
        const sprite = new NitroSprite(texture);

        const photoContainer = new NitroSprite();
        sprite.position.set(0, 0);
        photoContainer.addChild(sprite);

        const scaleFactor = (asset?.width || 64) / texture.width;
        const matrix = new Matrix();

        switch (this.direction) {
            case 2:
                matrix.a = scaleFactor;
                matrix.b = (-0.5 * scaleFactor);
                matrix.c = 0;
                matrix.d = scaleFactor;
                matrix.tx = 0;
                matrix.ty = (0.5 * scaleFactor * texture.width);
                break;
            case 0:
            case 4:
                matrix.a = scaleFactor;
                matrix.b = (0.5 * scaleFactor);
                matrix.c = 0;
                matrix.d = scaleFactor;
                matrix.tx = 0;
                matrix.ty = 0;
                break;
            default:
                matrix.a = scaleFactor;
                matrix.b = 0;
                matrix.c = 0;
                matrix.d = scaleFactor;
                matrix.tx = 0;
                matrix.ty = 0;
        }

        photoContainer.transform.setFromMatrix(matrix);

        const width = 64;
        const height = 64;

        const container = new NitroSprite();

        photoContainer.position.set(width / 2, height / 2);
        container.addChild(photoContainer);

        const renderTexture = await TextureUtils.generateTexture(container, null, null, 1);
        if (!renderTexture) {
            console.warn('IsometricImageFurniVisualization: Failed to generate render texture for thumbnail');
            return texture;
        }

        return renderTexture;
    }

    protected getSpriteAssetName(scale: number, layerId: number): string
    {
        if (this._thumbnailImageNormal && (this.getLayerTag(scale, this.direction, layerId) === IsometricImageFurniVisualization.THUMBNAIL)) {
            return `${this.getThumbnailAssetName(scale)}-${this._uniqueId}`;
        }

        return super.getSpriteAssetName(scale, layerId);
    }

    protected getThumbnailAssetName(scale: number): string
    {
        return this.cacheSpriteAssetName(scale, 2, false) + this.getFrameNumber(scale, 2);
    }

    protected getFullThumbnailAssetName(k: number, _arg_2: number): string
    {
        return [this._type, k, 'thumb', _arg_2].join('_');
    }
}