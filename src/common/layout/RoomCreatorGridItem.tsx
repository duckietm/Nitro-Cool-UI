import { FC, useMemo } from "react";
import { Base } from "../Base";
import { Column, ColumnProps } from "../Column";
import { LayoutItemCountView } from "./LayoutItemCountView";
import { LayoutLimitedEditionStyledNumberView } from "./limited-edition";

export interface RoomCreatorGridItemProps extends ColumnProps {
  itemImage?: string;
  itemColor?: string;
  itemActive?: boolean;
  itemCount?: number;
  itemCountMinimum?: number;
  itemUniqueSoldout?: boolean;
  itemUniqueNumber?: number;
  itemUnseen?: boolean;
  itemHighlight?: boolean;
  disabled?: boolean;
}

export const RoomCreatorGridItem: FC<RoomCreatorGridItemProps> = (props) => {
  const {
    itemImage = undefined,
    itemColor = undefined,
    itemActive = false,
    itemCount = 1,
    itemCountMinimum = 1,
    itemUniqueSoldout = false,
    itemUniqueNumber = -2,
    itemUnseen = false,
    itemHighlight = false,
    disabled = false,
    center = true,
    column = true,
    style = {},
    classNames = [],
    position = "relative",
    overflow = "hidden",
    children = null,
    ...rest
  } = props;

  const getClassNames = useMemo(() => {
    const newClassNames: string[] = ["room-creator-grid-item"];

    if (itemActive) newClassNames.push("active");

    if (itemUniqueSoldout || itemUniqueNumber > 0)
      newClassNames.push("unique-item");

    if (itemUniqueSoldout) newClassNames.push("sold-out");

    if (itemUnseen) newClassNames.push("unseen");

    if (itemHighlight) newClassNames.push("has-highlight");

    if (disabled) newClassNames.push("disabled");

    if (itemImage === null) newClassNames.push("icon", "loading-icon");

    if (classNames.length) newClassNames.push(...classNames);

    return newClassNames;
  }, [
    itemActive,
    itemUniqueSoldout,
    itemUniqueNumber,
    itemUnseen,
    itemHighlight,
    disabled,
    itemImage,
    classNames,
  ]);

  const getStyle = useMemo(() => {
    let newStyle = { ...style };

    if (itemImage) newStyle.backgroundImage = `url(${itemImage})`;

    if (itemColor) newStyle.backgroundColor = itemColor;

    if (Object.keys(style).length) newStyle = { ...newStyle, ...style };

    return newStyle;
  }, [style, itemImage, itemColor]);

  return (
    <Column
      center={center}
      pointer
      position={position}
      overflow={overflow}
      column={column}
      classNames={getClassNames}
      style={getStyle}
      {...rest}
    >
      {itemCount > itemCountMinimum && (
        <LayoutItemCountView className="text-black" count={itemCount} />
      )}
      {itemUniqueNumber > 0 && (
        <>
          <Base
            fit
            className="unique-bg-override"
            style={{ backgroundImage: `url(${itemImage})` }}
          />
          <div className="position-absolute bottom-0 unique-item-counter">
            <LayoutLimitedEditionStyledNumberView value={itemUniqueNumber} />
          </div>
        </>
      )}
      {children}
    </Column>
  );
};
