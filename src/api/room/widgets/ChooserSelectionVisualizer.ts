import { IRoomObjectSpriteVisualization, RoomObjectCategory } from '@nitrots/nitro-renderer';
import { ChooserSelectionFilter, GetRoomEngine } from '../..';

export class chooserSelectionVisualizer
{
    private static glowFilter = new ChooserSelectionFilter(
        [0.700, 0.880, 0.950],
        [0.290, 0.350, 0.390]
    );
    private static activeFilters: Map<string, ChooserSelectionFilter> = new Map();
    private static animationFrameId: number | null = null;

    private static startAnimation(): void
    {
        if (this.animationFrameId !== null) return;

        const animate = (time: number) => {
            const elapsed = time / 1000; // Convert to seconds
            this.activeFilters.forEach(filter => {
                filter.time = elapsed; // Update time uniform
            });
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    private static stopAnimation(): void
    {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    public static show(id: number, category: number = RoomObjectCategory.FLOOR): void
    {
        const roomObject = GetRoomEngine().getRoomObject(GetRoomEngine().activeRoomId, id, category);
        if (!roomObject) return;

        const visualization = roomObject.visualization as IRoomObjectSpriteVisualization;
        if (!visualization || !visualization.sprites || !visualization.sprites.length) return;

        // Create a unique filter instance for this object
        const filter = new ChooserSelectionFilter(
            [0.700, 0.880, 0.950],
            [0.290, 0.350, 0.390]
        );
        const key = `${id}_${category}`;
        this.activeFilters.set(key, filter);

        for (const sprite of visualization.sprites)
        {
            if (sprite.blendMode === 1) continue;
            sprite.filters = [filter];
        }

        this.startAnimation();
    }

    public static hide(id: number, category: number = RoomObjectCategory.FLOOR): void
    {
        const roomObject = GetRoomEngine().getRoomObject(GetRoomEngine().activeRoomId, id, category);
        if (!roomObject) return;

        const visualization = roomObject.visualization as IRoomObjectSpriteVisualization;
        if (!visualization) return;

        const key = `${id}_${category}`;
        this.activeFilters.delete(key);

        for (const sprite of visualization.sprites)
        {
            sprite.filters = [];
        }

        if (this.activeFilters.size === 0) {
            this.stopAnimation();
        }
    }

    public static clearAll(): void
    {
        const roomEngine = GetRoomEngine();

        const roomObjects = [
            ...roomEngine.getRoomObjects(roomEngine.activeRoomId, RoomObjectCategory.FLOOR),
            ...roomEngine.getRoomObjects(roomEngine.activeRoomId, RoomObjectCategory.WALL)
        ];

        for (const roomObject of roomObjects)
        {
            const visualization = roomObject.visualization as IRoomObjectSpriteVisualization;
            if (!visualization) continue;

            for (const sprite of visualization.sprites)
            {
                sprite.filters = [];
            }
        }

        this.activeFilters.clear();
        this.stopAnimation();
    }
}