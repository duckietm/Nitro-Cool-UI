import { FC } from "react";
import { GetConfiguration } from "../../../../../api";
import { RoomWidgetViewNight } from "./../../../views/widgets/rooms/RoomWidgetViewNight";
import { RoomWidgetView } from "./../../../views/widgets/rooms/RoomWidgetView";

export const HotelDay: FC<{}> = () => {
  const backgroundColor = GetConfiguration("hotelview")["images"]["background.colour"];
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const backgroundStyle = backgroundColor ? { background: backgroundColor } : {};

  const renderView = (elements: React.ReactNode) => (
    <div className="nitro-hotel-view" style={backgroundStyle}>
      {elements}
    </div>
  );

  return (
    renderView(
      <>
        <div className="left position-absolute">
          <div className="hotelview-back position-relative">
            <div className="stretch-blue position-relative" />
            <div className="back-e-alt-ii position-absolute" />
          </div>
        </div>
        <div className="drape position-absolute" />
        <div className="left position-absolute">
          <div className="hotelview position-relative">
            <div className="hotelview-orange position-relative" />
            <RoomWidgetView />
          </div>
        </div>
      </>
    )
  );
};