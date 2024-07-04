import { FC, useEffect, useState } from 'react';
import { GetConfigurationValue } from "../../../../../api";
import { RoomWidgetViewNight } from '../rooms/RoomWidgetViewNight';

export const HotelEvening: FC<{}> = (props) => {
  const backgroundColor = GetConfigurationValue('hotelview')['images']['background.colour'];
  const [show, setShow] = useState(false);
  const [landing, setLanding] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 7000);
    setTimeout(() => setLanding(true), 0);
  }, []);

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const timeRanges = [
    { start: 18 * 60, end: 18 * 60 + 30 },
    { start: 19 * 60, end: 19 * 60 + 30 },
    { start: 20 * 60, end: 20 * 60 + 30 },
    { start: 21 * 60, end: 21 * 60 + 30 },
    { start: 22 * 60, end: 22 * 60 + 30 },
    { start: 23 * 60, end: 23 * 60 + 30 },
  ];

  const shouldRender = timeRanges.some((range) => currentTime >= range.start && currentTime <= range.end);

  if (shouldRender) {
    return (
      <div className="nitro-hotel-view" style={(backgroundColor && backgroundColor) ? { background: backgroundColor } : {}}>
        <div className="left position-absolute">
          <div className="hotelview-back position-relative">
            <div className="stretch-blue-night position-relative" />
            <div className="back-c-alt position-absolute" />
          </div>
        </div>
        <div className="drape position-absolute" />
        <div className="left position-absolute">
          <div className="hotelview position-relative">
            <div className="hotelview-night position-relative" />
            <RoomWidgetViewNight />
            <div className="light-i position-absolute" />
            <div className="door position-absolute" />
            <div className="door-b position-absolute" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nitro-hotel-view" style={(backgroundColor && backgroundColor) ? { background: backgroundColor } : {}}>
      <div className="left position-absolute">
        <div className="hotelview-back position-relative">
          <div className="stretch-blue-night position-relative" />
          <div className="back-c-alt position-absolute" />
        </div>
      </div>
      <div className="drape position-absolute" />
      <div className="left position-absolute">
        <div className="hotelview position-relative">
          <div className="hotelview-night position-relative" />
          <RoomWidgetViewNight />
          <div className="light-i position-absolute" />
          <div className="door position-absolute" />
          <div className="door-b position-absolute" />
        </div>
      </div>
    </div>
  );
};