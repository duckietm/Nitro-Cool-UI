import { FC } from "react";
import { FaBolt } from "react-icons/fa";

import { Base } from "../Base";

export interface LayoutSearchSavesViewProps {
  title: string;
  onSaveSearch?: () => void;
  onClick?: () => void;
}

export const LayoutSearchSavesView: FC<LayoutSearchSavesViewProps> = (
  props
) => {
  const { title = null, onSaveSearch = null, onClick = null } = props;

  return (
    <Base
      color="white"
      className="button-search-saves"
      pointer
      title={title}
      onClickCapture={onSaveSearch}
      onClick={onClick}
    >
      <FaBolt />
    </Base>
  );
};
