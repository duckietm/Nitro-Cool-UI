import { FC } from "react";
import { GetConfiguration } from "../../../../../api";
import { RoomWidgetViewNight } from "./../../../views/widgets/rooms/RoomWidgetViewNight";
import { RoomWidgetView } from "./../../../views/widgets/rooms/RoomWidgetView";

export const HotelSunset: FC<{}> = () => {
  const backgroundColor = GetConfiguration("hotelview")["images"]["background.colour"];
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const backgroundStyle = backgroundColor && backgroundColor ? { background: backgroundColor } : {};

  const renderView = (elements: React.ReactNode) => (
    <div className="nitro-hotel-view" style={backgroundStyle}>
      {elements}
    </div>
  );

  return (
    <>
      {hour === 16 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-af-1 position-relative" />
                <div className="back-f-alt position-absolute" />
                <div className="back-f position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-j position-absolute" />
                <div className="light-j position-absolute" />
                <div className="light-j position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 16 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-af-2 position-relative" />
                <div className="back-g-alt position-absolute" />
                <div className="back-g position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="light-l position-absolute" />
                <div className="light-l-alt position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 17 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-af-3 position-relative" />
                <div className="back-h-alt position-absolute" />
                <div className="back-h position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="light-m position-absolute" />
                <div className="light-m-alt position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 17 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-af-4 position-relative" />
                <div className="back-h position-absolute" />
              </div>
            </div>
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="light-n position-absolute" />
                <div className="light-n-alt position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 18 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-af-5 position-relative" />
                <div className="back-h position-absolute" />
                <div className="back-n position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-k position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="light-n position-absolute" />
                <div className="light-n-alt-iii position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 18 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-af-6 position-relative" />
                <div className="back-h position-absolute" />
                <div className="back-n position-absolute" />
                <div className="back-k-final position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-k position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="light-o position-absolute" />
                <div className="light-o-alt position-absolute" />
                <div className="light-o-alt-ii position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 19 &&
        minutes <= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-night position-relative" />
                <div className="back-c-alt position-absolute" />
                <div className="back-c-alt position-absolute" />
                <div className="back-h position-absolute" />
                <div className="back-k-alt position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-m position-absolute" />
                <div className="front-m position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="front-j position-absolute" />
                <div className="light-p position-absolute" />
                <div className="light-p-alt position-absolute" />
                <div className="light-p-alt-ii position-absolute" />
              </div>
            </div>
          </>,
        )}
      {hour === 19 &&
        minutes >= 30 &&
        renderView(
          <>
            <div className="left position-absolute">
              <div className="hotelview-back position-relative">
                <div className="stretch-blue-night position-relative" />
                <div className="back-e position-absolute" />
                <div className="back-k-final position-absolute" />
                <div className="back-l position-absolute" />
                <div className="back-l position-absolute" />
              </div>
            </div>
            <div className="drape position-absolute" />
            <div className="left position-absolute">
              <div className="hotelview position-relative">
                <div className="hotelview-orange position-relative" />
                <RoomWidgetView />
                <div className="front-a position-absolute" />
                <div className="light-q position-absolute" />
                <div className="light-q-alt-ii position-absolute" />
              </div>
            </div>
          </>,
        )}
    </>
	
  );
};
