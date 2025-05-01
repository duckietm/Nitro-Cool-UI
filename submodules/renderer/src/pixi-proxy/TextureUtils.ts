import { AbstractRenderer, Renderer, RenderTexture, Resource, Texture } from '@pixi/core';
import { DisplayObject } from '@pixi/display';
import { Extract } from '@pixi/extract';
import { Matrix, Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { Sprite } from '@pixi/sprite';
import { PixiApplicationProxy } from './PixiApplicationProxy';

export class TextureUtils
{
    private static _extract: Extract | null = null;

    public static initialize(renderer: Renderer | AbstractRenderer): void
    {
        if (!this._extract && renderer) {
            this._extract = new Extract(renderer);
            console.log('TextureUtils: Initialized Extract plugin', { renderer });
        }
    }

    public static async generateImage(target: DisplayObject | RenderTexture): Promise<HTMLImageElement>
    {
        if (!target) {
            return null;
        }

        const extractor = this.getExtractor();
        if (!extractor) {
            return null;
        }

        try {
            const image = await extractor.image(target);

            if (!image || !image.src || typeof image.src !== 'string' || !image.src.startsWith('data:image/')) {
                const canvas = extractor.canvas(target);
                if (canvas) {
                    const dataUrl = canvas.toDataURL('image/png');
                    if (dataUrl && dataUrl.startsWith('data:image/')) {
                        const fallbackImage = new Image();
                        fallbackImage.src = dataUrl;
                        return fallbackImage;
                    }
                }
                const fallback = new Image();
                fallback.src = '';
                return fallback;
            }
            return image;
        } catch (error) {
            const fallback = new Image();
            fallback.src = '';
            return fallback;
        }
    }

    public static generateTexture(displayObject: DisplayObject, region: Rectangle = null, scaleMode: number = null, resolution: number = 1): RenderTexture
    {
        if (!displayObject) return null;

        if (scaleMode === null) scaleMode = settings.SCALE_MODE;

        return this.getRenderer().generateTexture(displayObject, {
            scaleMode,
            resolution,
            region
        });
    }

    public static generateTextureFromImage(image: HTMLImageElement): Texture<Resource>
    {
        if (!image) return null;

        return Texture.from(image);
    }

    public static async generateImageUrl(target: DisplayObject | RenderTexture): Promise<string>
    {
        if (!target) {
            return null;
        }

        const extractor = this.getExtractor();
        if (!extractor) {
            return null;
        }

        let base64: string | Promise<string> = extractor.base64(target);

        if (base64 && typeof base64 === 'object' && 'then' in base64) {
            try {
                base64 = await base64;
            } catch (error) {
                base64 = null;
            }
        }

        if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image/')) {
            const canvas = extractor.canvas(target);
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
                    return dataUrl;
                }
            }
            return null;
        }

        return base64;
    }

    public static generateCanvas(target: DisplayObject | RenderTexture): HTMLCanvasElement
    {
        if (!target) {
            return null;
        }

        const extractor = this.getExtractor();
        if (!extractor) {
            return null;
        }

        return extractor.canvas(target);
    }

    public static clearRenderTexture(renderTexture: RenderTexture): RenderTexture
    {
        if (!renderTexture) return null;

        return this.writeToRenderTexture(new Sprite(Texture.EMPTY), renderTexture);
    }

    public static createRenderTexture(width: number, height: number): RenderTexture
    {
        if (width < 0 || height < 0) return null;

        return RenderTexture.create({
            width,
            height
        });
    }

    public static createAndFillRenderTexture(width: number, height: number, color: number = 16777215): RenderTexture
    {
        if (width < 0 || height < 0) return null;

        const renderTexture = this.createRenderTexture(width, height);

        return this.clearAndFillRenderTexture(renderTexture, color);
    }

    public static createAndWriteRenderTexture(width: number, height: number, displayObject: DisplayObject, transform: Matrix = null): RenderTexture
    {
        if (width < 0 || height < 0) return null;

        const renderTexture = this.createRenderTexture(width, height);

        return this.writeToRenderTexture(displayObject, renderTexture, true, transform);
    }

    public static clearAndFillRenderTexture(renderTexture: RenderTexture, color: number = 16777215): RenderTexture
    {
        if (!renderTexture) return null;

        const sprite = new Sprite(Texture.WHITE);

        sprite.tint = color;
        sprite.width = renderTexture.width;
        sprite.height = renderTexture.height;

        return this.writeToRenderTexture(sprite, renderTexture);
    }

    public static writeToRenderTexture(displayObject: DisplayObject, renderTexture: RenderTexture, clear: boolean = true, transform: Matrix = null): RenderTexture
    {
        if (!displayObject || !renderTexture) return null;

        this.getRenderer().render(displayObject, {
            renderTexture,
            clear,
            transform
        });

        return renderTexture;
    }

    public static getPixels(displayObject: DisplayObject | RenderTexture, frame: Rectangle = null): Uint8Array
    {
        const extractor = this.getExtractor();
        if (!extractor) {
            return null;
        }

        return extractor.pixels(displayObject, frame);
    }

    public static getRenderer(): Renderer | AbstractRenderer
    {
        const renderer = PixiApplicationProxy.instance.renderer;
        if (!renderer) {
            console.warn('getRenderer: Renderer not available');
        }
        return renderer;
    }

    public static getExtractor(): Extract
    {
        if (!this._extract) {
            const renderer = this.getRenderer();
            if (renderer) {
                this._extract = new Extract(renderer);
            } else {
                throw new Error('Cannot initialize Extract: Renderer not available');
            }
        }
        return this._extract;
    }
}