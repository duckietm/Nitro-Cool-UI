import { Resource, Texture } from '@pixi/core';
import { IAssetManager, IDisposable, IMessageEvent, NitroConfiguration } from '../../../api';
import { BadgeImageReadyEvent } from '../../../events';
import { NitroContainer, NitroSprite, NitroTexture, TextureUtils } from '../../../pixi-proxy';
import { GroupBadgePartsEvent } from '../../communication';
import { SessionDataManager } from './../SessionDataManager';
import { BadgeInfo } from './BadgeInfo';
import { GroupBadge } from './GroupBadge';
import { GroupBadgePart } from './GroupBadgePart';

export class BadgeImageManager implements IDisposable
{
    public static GROUP_BADGE: string = 'group_badge';
    public static NORMAL_BADGE: string = 'normal_badge';

    private _assets: IAssetManager;
    private _sessionDataManager: SessionDataManager;
    private _messages: IMessageEvent[];

    private _groupBases: Map<number, string[]> = new Map();
    private _groupSymbols: Map<number, string[]> = new Map();
    private _groupPartColors: Map<number, string> = new Map();
    private _requestedBadges: Map<string, boolean> = new Map();
    private _groupBadgesQueue: Map<string, boolean> = new Map();
    private _readyToGenerateGroupBadges: boolean = false;
    private _groupBadgeAssetsLoaded: boolean = false;
    private _groupBadgeAssetsLoading: Promise<boolean> = null;
    private _groupBadgeRetryTimeout: ReturnType<typeof setTimeout> = null;

    constructor(assetManager: IAssetManager, sessionDataManager: SessionDataManager)
    {
        this._assets = assetManager;
        this._sessionDataManager = sessionDataManager;
    }

    public init(): void
    {
        if(this._sessionDataManager && this._sessionDataManager.communication)
        {
            this._messages = [
                new GroupBadgePartsEvent(this.onGroupBadgePartsEvent.bind(this))
            ];

            for(const message of this._messages)
                this._sessionDataManager.communication.registerMessageEvent(message);
        }
    }

    public dispose(): void
    {
        if(this._messages && this._messages.length)
        {
            for(const message of this._messages)
                this._sessionDataManager.communication.removeMessageEvent(message);

            this._messages = null;
        }

        this._sessionDataManager = null;
    }

    public getBadgeImage(badgeName: string, type: string = BadgeImageManager.NORMAL_BADGE, load: boolean = true): Texture<Resource>
    {
        return this.getBadgeTexture(badgeName, type);
    }

    public getBadgeInfo(k: string): BadgeInfo
    {
        const badge = this.getBadgeTexture(k);

        return (badge) ? new BadgeInfo(badge, false) : new BadgeInfo(this.getBadgePlaceholder(), true);
    }

    public loadBadgeImage(badgeName: string, type: string = BadgeImageManager.NORMAL_BADGE): string
    {
        if(this._assets.getTexture(this.getBadgeUrl(badgeName, type))) return badgeName;

        this.getBadgeTexture(badgeName, type);

        return null;
    }

    private getBadgeTexture(badgeName: string, type: string = BadgeImageManager.NORMAL_BADGE): Texture<Resource>
    {
        const url = this.getBadgeUrl(badgeName, type);

        if(!url || !url.length) return null;

        const existing = this._assets.getTexture(url);

        if(existing) return existing.clone();

        if(type === BadgeImageManager.NORMAL_BADGE)
        {
            const loadBadge = async () =>
            {
                try
                {
                    if(!await this._assets.downloadAsset(url)) return;

                    const loadedTexture = this._assets.getTexture(url);

                    if(loadedTexture && this._sessionDataManager)
                        this._sessionDataManager.events.dispatchEvent(new BadgeImageReadyEvent(badgeName, loadedTexture.clone()));
                }
                catch(err)
                {
                    console.error(err);
                }
            };

            void loadBadge();
        }
        else if(type === BadgeImageManager.GROUP_BADGE)
        {
            this._groupBadgesQueue.set(badgeName, true);
            void this.processGroupBadgeQueue();
        }

        return this.getBadgePlaceholder();
    }

    private getBadgePlaceholder(): Texture<Resource>
    {
        const url = (NitroConfiguration.getValue<string>('images.url') + '/loading_icon.png');
        const existing = this._assets.getTexture(url);

        if(!existing) return null;

        return existing.clone();
    }

    public getBadgeUrl(badge: string, type: string = BadgeImageManager.NORMAL_BADGE): string
    {
        let url = null;

        switch(type)
        {
            case BadgeImageManager.NORMAL_BADGE:
                url = (NitroConfiguration.getValue<string>('badge.asset.url')).replace('%badgename%', badge);
                break;
            case BadgeImageManager.GROUP_BADGE:
                url = badge;
                break;
        }

        return url;
    }

    private scheduleQueueRetry(): void
    {
        if(this._groupBadgeRetryTimeout) return;

        this._groupBadgeRetryTimeout = setTimeout(() =>
        {
            this._groupBadgeRetryTimeout = null;
            void this.processGroupBadgeQueue();
        }, 250);
    }

    private async ensureGroupBadgeAssetsLoaded(): Promise<boolean>
    {
        return true;
    }

    private async processGroupBadgeQueue(): Promise<void>
    {
        if(!this._readyToGenerateGroupBadges || !this._groupBadgesQueue.size) return;

        if(!await this.ensureGroupBadgeAssetsLoaded())
        {
            this.scheduleQueueRetry();
            return;
        }

        let hasPending = false;

        for(const badgeCode of Array.from(this._groupBadgesQueue.keys()))
        {
            if(!this.loadGroupBadge(badgeCode)) hasPending = true;
        }

        if(hasPending) this.scheduleQueueRetry();
    }

    private loadGroupBadge(badgeCode: string): boolean
    {
        const groupBadge = new GroupBadge(badgeCode);

        const partMatches = [...badgeCode.matchAll(/[bst][0-9]{4,6}/g)];

        for(const partMatch of partMatches)
        {
            const partCode = partMatch[0];
            const shortMethod = (partCode.length === 6);
            const partType = partCode[0];
            const parsedPartId = parseInt(partCode.slice(1, shortMethod ? 3 : 4));
            const partId = ((partType === GroupBadgePart.SYMBOL_ALT) ? (parsedPartId + 100) : parsedPartId);
            const partColor = parseInt(partCode.slice(shortMethod ? 3 : 4, shortMethod ? 5 : 6));
            const partPosition = partCode.length < 6 ? 0 : parseInt(partCode.slice(shortMethod ? 5 : 6, shortMethod ? 6 : 7));

            const part = new GroupBadgePart(partType, partId, partColor, partPosition);
            groupBadge.parts.push(part);
        }

        if(!this.renderGroupBadge(groupBadge)) return false;

        this._requestedBadges.delete(groupBadge.code);
        this._groupBadgesQueue.delete(groupBadge.code);

        return true;
    }

    private renderGroupBadge(groupBadge: GroupBadge): boolean
    {
        const container = new NitroContainer();
        const tempSprite = new NitroSprite(NitroTexture.EMPTY);
        let renderedLayers = 0;

        tempSprite.width = GroupBadgePart.IMAGE_WIDTH;
        tempSprite.height = GroupBadgePart.IMAGE_HEIGHT;
        container.addChild(tempSprite);

        for(const part of groupBadge.parts)
        {
            let isFirst = true;
            let renderedPartLayers = 0;

            const partNames = ((part.type === 'b') ? this._groupBases.get(part.key) : this._groupSymbols.get(part.key));

            if(!partNames || !partNames.length) return false;

            for(const partName of partNames)
            {
                if(!partName || !partName.length) continue;

                const texture = this.getBadgePartTexture(part.type, partName);

                if(!texture) continue;

                const { x, y } = part.calculatePosition(texture);
                const sprite = new NitroSprite(texture);

                sprite.position.set(x, y);

                if(isFirst)
                {
                    const tintColor = this.getPartTintColor(part.color);
                    if(tintColor !== null) sprite.tint = tintColor;
                }

                isFirst = false;
                renderedLayers++;
                renderedPartLayers++;
                container.addChild(sprite);
            }

            if(!renderedPartLayers) return false;
        }

        if(!renderedLayers) return false;

        const texture = TextureUtils.generateTexture(container);

        this._assets.setTexture(groupBadge.code, texture);

        if(this._sessionDataManager)
            this._sessionDataManager.events.dispatchEvent(new BadgeImageReadyEvent(groupBadge.code, texture));

        return true;
    }

    private getBadgePartTexture(partType: string, rawPartName: string): Texture<Resource>
    {
        const partName = rawPartName.replace('.png', '').replace('.gif', '');
        const withoutLayerSuffix = partName.replace(/_part[12]$/i, '');

        const candidates = new Set<string>();
        candidates.add(partName);
        candidates.add(withoutLayerSuffix);
        candidates.add(`badgepart_${partName}`);
        candidates.add(`badgepart_${withoutLayerSuffix}`);

        if(!partName.startsWith('badgepart_'))
        {
            if((partType === 's') || (partType === 't'))
            {
                candidates.add(`badgepart_symbol_${partName}`);
                candidates.add(`badgepart_symbol_${withoutLayerSuffix}`);
            }

            if(partType === 'b')
            {
                candidates.add(`badgepart_base_${partName}`);
                candidates.add(`badgepart_base_${withoutLayerSuffix}`);
            }
        }

        for(const candidate of candidates)
        {
            const texture = this._assets.getTexture(candidate);
            if(texture) return texture.clone();
        }

        return null;
    }

    private getPartTintColor(colorId: number): number | null
    {
        let colorHex = (this._groupPartColors.get(colorId) || this._groupPartColors.get(1) || 'FFFFFF');

        if(!colorHex || !colorHex.length) return null;
        if(colorHex.startsWith('#')) colorHex = colorHex.substring(1);

        const tintColor = parseInt(colorHex, 16);

        return Number.isFinite(tintColor) ? tintColor : null;
    }

    private onGroupBadgePartsEvent(event: GroupBadgePartsEvent): void
    {
        if(!event) return;

        const data = event.getParser();

        if(!data) return;

        data.bases.forEach((names, id) => this._groupBases.set(id, names.map(val => val.replace('.png', '').replace('.gif', ''))));
        data.symbols.forEach((names, id) => this._groupSymbols.set(id, names.map(val => val.replace('.png', '').replace('.gif', ''))));

        this._groupPartColors = data.partColors;
        this._readyToGenerateGroupBadges = true;

        void this.processGroupBadgeQueue();
    }

    public get disposed(): boolean
    {
        return !!this._sessionDataManager;
    }
}