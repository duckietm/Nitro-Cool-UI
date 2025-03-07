import { NitroPoint } from '@nitrots/nitro-renderer';
import { ActionSettings } from './ActionSettings';
import { FloorAction, HEIGHT_SCHEME, MAX_NUM_TILE_PER_AXIS, TILE_SIZE } from './Constants';
import { imageBase64, spritesheet } from './FloorplanResource';
import { Tile } from './Tile';
import { getScreenPositionForTile, getTileFromScreenPosition } from './Utils';

export class FloorplanEditor {
    private static _INSTANCE: FloorplanEditor = null;

    public static readonly TILE_BLOCKED = 'r_blocked';
    public static readonly TILE_DOOR = 'r_door';

    private _squareSelectMode: boolean = false;
    private _selectionStart: NitroPoint = null;
    private _selectionEnd: NitroPoint = null;

    private _tilemap: Tile[][];
    private _width: number;
    private _height: number;
    private _isPointerDown: boolean;
    private _doorLocation: NitroPoint;
    private _lastUsedTile: NitroPoint;
    private _renderer: CanvasRenderingContext2D;
    private _actionSettings: ActionSettings;
    private _image: HTMLImageElement;

    private _zoomLevel: number = 1.0;

    constructor() {
        const width = TILE_SIZE * MAX_NUM_TILE_PER_AXIS + 20;
        const height = (TILE_SIZE * MAX_NUM_TILE_PER_AXIS) / 2 + 100;

        const canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        canvas.style.touchAction = 'none';

        canvas.oncontextmenu = (e) => { e.preventDefault(); };

        this._renderer = canvas.getContext('2d');

        this._image = new Image();
        this._image.src = imageBase64;

        this._tilemap = [];
        this._doorLocation = new NitroPoint(0, 0);
        this._width = 0;
        this._height = 0;
        this._isPointerDown = false;
        this._lastUsedTile = new NitroPoint(-1, -1);
        this._actionSettings = new ActionSettings();
    }

    public setSquareSelectMode(enabled: boolean): void {
        this._squareSelectMode = enabled;
        if (!enabled) {
            this._selectionStart = null;
            this._selectionEnd = null;
        }
    }

    public get squareSelectMode(): boolean {
        return this._squareSelectMode;
    }

    public onPointerRelease(): void {
        this._isPointerDown = false;
        if (this._squareSelectMode && this._selectionStart) {
            this.finalizeSquareSelection();
        }
    }

    public onPointerDown(event: PointerEvent): void {
        if (this._squareSelectMode) {
            event.preventDefault();
            const location = new NitroPoint(event.offsetX / this._zoomLevel, event.offsetY / this._zoomLevel);
            const [tileX, tileY] = getTileFromScreenPosition(location.x, location.y);
            const roundedX = Math.floor(tileX);
            const roundedY = Math.floor(tileY);
            this._selectionStart = new NitroPoint(roundedX, roundedY);
            this._selectionEnd = new NitroPoint(roundedX, roundedY);
            this._isPointerDown = true;
            return;
        }
        if (event.button === 2) return;
        const location = new NitroPoint(event.offsetX / this._zoomLevel, event.offsetY / this._zoomLevel);
        this._isPointerDown = true;
        this.tileHitDetection(location, true);
    }

    public onPointerMove(event: PointerEvent): void {
        if (!this._isPointerDown) return;
        const location = new NitroPoint(event.offsetX / this._zoomLevel, event.offsetY / this._zoomLevel);
        if (this._squareSelectMode && this._selectionStart) {
            const [tileX, tileY] = getTileFromScreenPosition(location.x, location.y);
            this._selectionEnd.x = Math.floor(tileX);
            this._selectionEnd.y = Math.floor(tileY);
            this.renderTiles();
            return;
        }
        this.tileHitDetection(location, false);
    }

    private tileHitDetection(tempPoint: NitroPoint, isClick: boolean = false): boolean {
        const mousePositionX = Math.floor(tempPoint.x);
        const mousePositionY = Math.floor(tempPoint.y);
        const width = TILE_SIZE;
        const height = TILE_SIZE / 2;
        for (let y = 0; y < this._tilemap.length; y++) {
            for (let x = 0; x < this.tilemap[y].length; x++) {
                const [tileStartX, tileStartY] = getScreenPositionForTile(x, y);
                const centreX = tileStartX + (width / 2);
                const centreY = tileStartY + (height / 2);
                const dx = Math.abs(mousePositionX - centreX);
                const dy = Math.abs(mousePositionY - centreY);
                const solution = (dx / (width * 0.5) + dy / (height * 0.5) <= 1);
                if (solution) {
                    if (this._isPointerDown) {
                        if (isClick) {
                            this.onClick(x, y);
                        } else if (this._lastUsedTile.x !== x || this._lastUsedTile.y !== y) {
                            this._lastUsedTile.x = x;
                            this._lastUsedTile.y = y;
                            this.onClick(x, y);
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }

    private onClick(x: number, y: number, render: boolean = true, force: boolean = false): void {
        const tile = this._tilemap[y][x];
        let currentHeightIndex = (tile.height === 'x' && force) ? 0 : HEIGHT_SCHEME.indexOf(tile.height);
        let futureHeightIndex = 0;
        switch (this._actionSettings.currentAction) {
            case FloorAction.DOOR:
                if (!force && tile.height !== 'x') {
                    this._doorLocation.x = x;
                    this._doorLocation.y = y;
                    if (render) this.renderTiles();
                }
                return;
            case FloorAction.UP:
                if (!force && tile.height === 'x') return;
                futureHeightIndex = currentHeightIndex + 1;
                break;
            case FloorAction.DOWN:
                if (!force && (tile.height === 'x' || (currentHeightIndex <= 1))) return;
                futureHeightIndex = currentHeightIndex - 1;
                break;
            case FloorAction.SET:
                futureHeightIndex = HEIGHT_SCHEME.indexOf(this._actionSettings.currentHeight);
                break;
            case FloorAction.UNSET:
                futureHeightIndex = 0;
                break;
        }
        if (futureHeightIndex === -1) return;
        if (currentHeightIndex === futureHeightIndex) return;
        if (!force && futureHeightIndex > 0) {
            if ((x + 1) > this._width) this._width = x + 1;
            if ((y + 1) > this._height) this._height = y + 1;
        }
        const newHeight = HEIGHT_SCHEME[futureHeightIndex];
        if (!newHeight) return;
        this._tilemap[y][x].height = newHeight;
        if (render) this.renderTiles();
    }

    public renderTiles(): void {
        this.clearCanvas();
        this._renderer.save();
        this._renderer.scale(this._zoomLevel, this._zoomLevel);

        for (let y = 0; y < this._tilemap.length; y++) {
            for (let x = 0; x < this.tilemap[y].length; x++) {
                const tile = this.tilemap[y][x];
                let assetName = tile.height;
                if (this._doorLocation.x === x && this._doorLocation.y === y)
                    assetName = FloorplanEditor.TILE_DOOR;
                if (tile.isBlocked) assetName = FloorplanEditor.TILE_BLOCKED;
                if ((tile.height === 'x' || tile.height === 'X') && tile.isBlocked) assetName = 'x';
                const [positionX, positionY] = getScreenPositionForTile(x, y);
                const asset = spritesheet.frames[assetName];
                if (asset === undefined) {
                    console.warn(`Asset "${assetName}" not found in spritesheet.`);
                    continue;
                }
                this.renderer.drawImage(
                    this._image,
                    asset.frame.x,
                    asset.frame.y,
                    asset.frame.w,
                    asset.frame.h,
                    positionX,
                    positionY,
                    asset.frame.w,
                    asset.frame.h
                );

                if (this._squareSelectMode && this._isPointerDown && this._selectionStart && this._selectionEnd) {
                    const selMinX = Math.min(this._selectionStart.x, this._selectionEnd.x);
                    const selMaxX = Math.max(this._selectionStart.x, this._selectionEnd.x);
                    const selMinY = Math.min(this._selectionStart.y, this._selectionEnd.y);
                    const selMaxY = Math.max(this._selectionStart.y, this._selectionEnd.y);
                    if (x >= selMinX && x <= selMaxX && y >= selMinY && y <= selMaxY) {
                        this.renderer.fillStyle = 'rgba(0, 255, 0, 0.3)';
                        this.renderer.fillRect(positionX, positionY, asset.frame.w, asset.frame.h);
                        continue;
                    }
                }

                if (tile.selected) {
                    this.renderer.fillStyle = tile.isBlocked ? 'rgb(128, 0, 128)' : 'rgba(0, 0, 255, 0.3)';
                    this.renderer.fillRect(positionX, positionY, asset.frame.w, asset.frame.h);
                }
            }
        }
        this._renderer.restore();
    }

    public toggleSelectAll(): void {
        for (let y = 0; y < this._tilemap.length; y++) {
            for (let x = 0; x < this._tilemap[y].length; x++) {
                this._tilemap[y][x].selected = true;
                if (this._actionSettings.currentAction !== FloorAction.DOOR) {
                    const tile = this._tilemap[y][x];
                    let currentHeightIndex = tile.height === 'x' ? 0 : HEIGHT_SCHEME.indexOf(tile.height);
                    let futureHeightIndex = 0;
                    switch (this._actionSettings.currentAction) {
                        case FloorAction.UP:
                            if (tile.height === 'x') continue;
                            futureHeightIndex = currentHeightIndex + 1;
                            break;
                        case FloorAction.DOWN:
                            if (tile.height === 'x' || currentHeightIndex <= 1) continue;
                            futureHeightIndex = currentHeightIndex - 1;
                            break;
                        case FloorAction.SET:
                            futureHeightIndex = HEIGHT_SCHEME.indexOf(this._actionSettings.currentHeight);
                            break;
                        case FloorAction.UNSET:
                            futureHeightIndex = 0;
                            break;
                        default:
                            continue;
                    }
                    if (futureHeightIndex !== -1 && currentHeightIndex !== futureHeightIndex) {
                        const newHeight = HEIGHT_SCHEME[futureHeightIndex];
                        if (newHeight) {
                            this._tilemap[y][x].height = newHeight;
                            if ((x + 1) > this._width) this._width = x + 1;
                            if ((y + 1) > this._height) this._height = y + 1;
                        }
                    }
                }
            }
        }
        this.recalcActiveArea();
        this.renderTiles();
    }

    private finalizeSquareSelection(): void {
        const startX = Math.floor(this._selectionStart.x);
        const startY = Math.floor(this._selectionStart.y);
        const endX = Math.floor(this._selectionEnd.x);
        const endY = Math.floor(this._selectionEnd.y);
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        this.selectSquareField(minX, minY, maxX, maxY);
        this._selectionStart = null;
        this._selectionEnd = null;
        this.renderTiles();
    }

    private selectSquareField(x1: number, y1: number, x2: number, y2: number): void {
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                if (this._tilemap[y] && this._tilemap[y][x]) {
                    this._tilemap[y][x].selected = true;
                    this.onClick(x, y, false, true);
                }
            }
        }
        this.recalcActiveArea();
        this.renderTiles();
    }

    private recalcActiveArea(): void {
        this._width = 0;
        this._height = 0;
        for (let y = 0; y < this._tilemap.length; y++) {
            for (let x = 0; x < this._tilemap[y].length; x++) {
                if (this._tilemap[y][x].height !== 'x') {
                    if ((x + 1) > this._width) this._width = x + 1;
                    if ((y + 1) > this._height) this._height = y + 1;
                }
            }
        }
    }

    public setTilemap(map: string, blockedTiles: boolean[][]): void {
        this._tilemap = [];
        const roomMapStringSplit = map.split('\r');
        let width = 0;
        let height = roomMapStringSplit.length;
        for (let y = 0; y < height; y++) {
            const originalRow = roomMapStringSplit[y];
            if (originalRow.length === 0) {
                roomMapStringSplit.splice(y, 1);
                height = roomMapStringSplit.length;
                y--;
                continue;
            }
            if (originalRow.length > width) {
                width = originalRow.length;
            }
        }
        for (let y = 0; y < height; y++) {
            this._tilemap[y] = [];
            const rowString = roomMapStringSplit[y];
            for (let x = 0; x < width; x++) {
                const blocked = (blockedTiles[y] && blockedTiles[y][x]) || false;
                const char = rowString[x];
                if ((!(char === 'x')) && (!(char === 'X')) && char) {
                    this._tilemap[y][x] = new Tile(char, blocked);
                } else {
                    this._tilemap[y][x] = new Tile('x', blocked);
                }
            }
            for (let x = width; x < MAX_NUM_TILE_PER_AXIS; x++) {
                this.tilemap[y][x] = new Tile('x', false);
            }
        }
        for (let y = height; y < MAX_NUM_TILE_PER_AXIS; y++) {
            if (!this.tilemap[y]) this.tilemap[y] = [];
            for (let x = 0; x < MAX_NUM_TILE_PER_AXIS; x++) {
                this.tilemap[y][x] = new Tile('x', false);
            }
        }
        this._width = width;
        this._height = height;
    }

    public getCurrentTilemapString(): string {
        const highestTile = this._tilemap[this._height - 1][this._width - 1];
        if (highestTile.height === 'x') {
            this._width = -1;
            this._height = -1;
            for (let y = MAX_NUM_TILE_PER_AXIS - 1; y >= 0; y--) {
                if (!this._tilemap[y]) continue;
                for (let x = MAX_NUM_TILE_PER_AXIS - 1; x >= 0; x--) {
                    if (!this._tilemap[y][x]) continue;
                    const tile = this._tilemap[y][x];
                    if (tile.height !== 'x') {
                        if ((x + 1) > this._width)
                            this._width = x + 1;
                        if ((y + 1) > this._height)
                            this._height = y + 1;
                    }
                }
            }
        }
        const rows = [];
        for (let y = 0; y < this._height; y++) {
            const row = [];
            for (let x = 0; x < this._width; x++) {
                const tile = this._tilemap[y][x];
                row[x] = tile.height;
            }
            rows[y] = row.join('');
        }
        return rows.join('\r');
    }

    public clear(): void {
        this._tilemap = [];
        this._doorLocation.set(-1, -1);
        this._width = 0;
        this._height = 0;
        this._isPointerDown = false;
        this._lastUsedTile.set(-1, -1);
        this._actionSettings.clear();
        this.clearCanvas();
    }

    public clearCanvas(): void {
        this.renderer.fillStyle = '#000000';
        this.renderer.fillRect(0, 0, this._renderer.canvas.width, this._renderer.canvas.height);
    }

    public zoomIn(): void {
        this._zoomLevel = Math.min(this._zoomLevel + 0.1, 2.0);
        this.adjustCanvasSize();
        this.renderTiles();
    }

    public zoomOut(): void {
        this._zoomLevel = Math.max(this._zoomLevel - 0.1, 0.5);
        this.adjustCanvasSize();
        this.renderTiles();
    }

    private adjustCanvasSize(): void {
        const baseWidth = TILE_SIZE * MAX_NUM_TILE_PER_AXIS + 20;
        const baseHeight = (TILE_SIZE * MAX_NUM_TILE_PER_AXIS) / 2 + 100;
        this._renderer.canvas.width = baseWidth * this._zoomLevel;
        this._renderer.canvas.height = baseHeight * this._zoomLevel;
    }

    public get zoomLevel(): number {
        return this._zoomLevel;
    }

    public get renderer(): CanvasRenderingContext2D {
        return this._renderer;
    }

    public get tilemap(): Tile[][] {
        return this._tilemap;
    }

    public get doorLocation(): NitroPoint {
        return this._doorLocation;
    }

    public set doorLocation(value: NitroPoint) {
        this._doorLocation = value;
    }

    public get actionSettings(): ActionSettings {
        return this._actionSettings;
    }

    public static get instance(): FloorplanEditor {
        if (!FloorplanEditor._INSTANCE) {
            FloorplanEditor._INSTANCE = new FloorplanEditor();
        }
        return FloorplanEditor._INSTANCE;
    }
}