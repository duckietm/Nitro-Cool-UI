import { FurnitureType, GetRoomEngine } from '@nitrots/nitro-renderer';
import { FurniCategory } from '../inventory';

export class ProductImageUtility
{
    public static getProductImageUrl(productType: FurnitureType, furniClassId: number, extraParam: string): string
    {
        let imageUrl: string = null;

        switch(productType)
        {
            case FurnitureType.FLOOR:
                imageUrl = GetRoomEngine().getFurnitureFloorIconUrl(furniClassId);
                break;
            case FurnitureType.WALL:
                const productCategory = this.getProductCategory(CatalogPageMessageProductData.I, furniClassId);

                if(productCategory === 1)
                {
                    imageUrl = GetRoomEngine().getFurnitureWallIconUrl(furniClassId, extraParam);
                }
                else
                {
                    switch(productCategory)
                    {
                        case FurniCategory.WALL_PAPER:
                            break;
                        case FurniCategory.LANDSCAPE:
                            break;
                        case FurniCategory.FLOOR:
                            break;
                    }
                }
                break;
             case FurnitureType.EFFECT:
            // fx_icon_furniClassId_png
                break;
        }

        return imageUrl;
    }

    public static getProductCategory(productType: FurnitureType, furniClassId: number): number
    {
        if(productType === FurnitureType.FLOOR) return 1;

        if(productType === FurnitureType.WALL)
        {
            if(furniClassId === 3001) return FurniCategory.WALL_PAPER;

            if(furniClassId === 3002) return FurniCategory.FLOOR;

            if(furniClassId === 4057) return FurniCategory.LANDSCAPE;
        }

        return 1;
    }
}
