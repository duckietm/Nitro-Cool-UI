import '@pixi/canvas-display';
import { extensions } from '@pixi/core';
import '@pixi/graphics-extras';
import { AppLoaderPlugin } from '@pixi/loaders';
import '@pixi/math-extras';
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
import '@pixi/polyfill';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
import { TickerPlugin } from '@pixi/ticker';

extensions.add(
    TilingSpriteRenderer
);