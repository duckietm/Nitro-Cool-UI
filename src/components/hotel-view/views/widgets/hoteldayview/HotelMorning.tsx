import { FC } from "react";
import { GetConfiguration } from "../../../../../api";
import { RoomWidgetViewNight } from "./../../../views/widgets/rooms/RoomWidgetViewNight";
import { RoomWidgetView } from "./../../../views/widgets/rooms/RoomWidgetView";

export const HotelMorning: FC<{}> = () => {
  const backgroundColor = GetConfiguration("hotelview")["images"]["background.colour"];
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const backgroundStyle = backgroundColor && backgroundColor ? { background: backgroundColor } : {};

  const renderDefaultView = () => (
    <div className="nitro-hotel-view" style={backgroundStyle}>
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
    </div>
  );

  const renderView = (elements: React.ReactNode) => (
    <div className="nitro-hotel-view" style={backgroundStyle}>
      {elements}
    </div>
  );

  return (
    <>
      {hour === 6 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-night position-relative" />
                <div className="back-a position-absolute" />
                <div className="back-a position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-night position-relative" />
                <RoomWidgetViewNight />
                <div className="light-a position-absolute" />
                <div className="light-a position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 6 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-night position-relative" />
                <div className="back-a-alt position-absolute" />
                <div className="back-b position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-a position-absolute" />
                <div className="light-a position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 7 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-night position-relative" />
                <div className="back-a-alt position-absolute" />
                <div className="back-c-alt position-absolute" />
                <div className="back-b position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-c position-absolute" />
                <div className="front-b position-absolute" />
                <div className="light-b position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 7 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue position-relative" />
                <div className="back-d position-absolute" />
                <div className="back-c position-absolute" />
                <div className="back-b position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-c position-absolute" />
                <div className="front-b position-absolute" />
                <div className="light-d position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 8 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue position-relative" />
                <div className="back-d position-absolute" />
                <div className="back-e-alt-ii position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-c position-absolute" />
                <div className="front-c position-absolute" />
                <div className="front-c position-absolute" />
                <div className="front-c position-absolute" />
                <div className="light-e  position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 8 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue position-relative" />
                <div className="back-e-alt-iii position-absolute" />
                <div className="back-d position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-c position-absolute" />
                <div className="front-c position-absolute" />
                <div className="front-c position-absolute" />
                <div className="light-f position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 9 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue position-relative" />
                <div className="back-e-alt-iv position-absolute" />
                <div className="back-d position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-d position-absolute" />
                <div className="light-gg-alt position-absolute" />
                <div className="light-g position-absolute" />
                <div className="light-g position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 9 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue position-relative" />
                <div className="back-e position-absolute" />
                <div className="back-e-alt-v position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="light-gg-alt position-absolute" />
                <div className="light-g position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 10 &&
        minutes <= 30 &&
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
                <div className="light-i position-absolute" />
              </div>
            </div>
          </>,
        )}
    </>
 );
};
