import { Renderer, RenderTexture, Texture, BaseTexture } from '@pixi/core';
import { DisplayObject } from '@pixi/display';
import { Extract } from '@pixi/extract';
import { Matrix, Rectangle } from '@pixi/math';
import { SCALE_MODES } from '@pixi/constants';
import { Sprite } from '@pixi/sprite';
import { PixiApplicationProxy } from './PixiApplicationProxy';

export class TextureUtils
{
    private static _extract: Extract | null = null;

    public static initialize(renderer: Renderer): void
    {
        if (!this._extract && renderer) {
            this._extract = new Extract(renderer);
            console.log('TextureUtils: Initialized Extract plugin', { renderer });
        }
    }

    public static async generateImage(target: DisplayObject | RenderTexture): Promise<HTMLImageElement> {
        if (!target) {
            console.warn('generateImage: Invalid target', { target });
            return null;
        }

        const extractor = this.getExtractor();
        if (!extractor) {
            console.warn('generateImage: Extractor not available');
            return null;
        }

        try {
            if (target instanceof DisplayObject) {
                const renderTexture = this.createRenderTexture(target.width, target.height);
                this.writeToRenderTexture(target, renderTexture);
                target = renderTexture;
            }

            const image = await extractor.image(target);
            console.log('generateImage: Extracted image', { src: image?.src, isValid: image?.src?.startsWith('data:image/') });

            if (!image || !image.src || !image.src.startsWith('data:image/')) {
                const canvas = extractor.canvas(target);
                if (canvas) {
                    const dataUrl = canvas.toDataURL('image/png');
                    console.log('generateImage: Fallback canvas', { dataUrl });
                    if (dataUrl && dataUrl.startsWith('data:image/')) {
                        const fallbackImage = new Image();
                        fallbackImage.src = dataUrl;
                        return fallbackImage;
                    }
                }
                console.warn('generateImage: Failed to generate valid image', { target });
                const fallback = new Image();
                fallback.src = '';
                return fallback;
            }
            return image;
        } catch (error) {
            console.error('generateImage: Error extracting image', { error: error.message, target });
            const fallback = new Image();
            fallback.src = '';
            return fallback;
        }
    }

    public static generateTexture(displayObject: DisplayObject, region: Rectangle = null, scaleMode: SCALE_MODES = SCALE_MODES.LINEAR, resolution: number = 1): RenderTexture
    {
        if (!displayObject) return null;

        return this.getRenderer().generateTexture(displayObject, {
            scaleMode,
            resolution,
            region
        });
    }

    public static generateTextureFromImage(image: HTMLImageElement): Texture<BaseTexture>
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

    public static createAndFillRenderTexture(width: number, height: number, color: number = 0xFFFFFF): RenderTexture
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

    public static clearAndFillRenderTexture(renderTexture: RenderTexture, color: number = 0xFFFFFF): RenderTexture
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

    public static getRenderer(): Renderer
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