import { CreateLinkEvent, GetConfiguration } from '@nitrots/nitro-renderer';
import React, { FC } from 'react';
import { Base, Flex } from '../../../../../common';

interface Room {
  id: string;
  className: string;
}

const rooms: Room[] = [
  { id: 'room.rooftop', className: 'rooftop-night' },
  { id: 'room.rooftop.pool', className: 'rooftop-pool-night' },
  { id: 'room.picnic', className: 'picnic-night' },
  { id: 'room.peaceful', className: 'peaceful-night' },
  { id: 'room.pool', className: 'pool-night' },
  { id: 'room.infobus', className: 'infobus-night' },
  { id: 'room.lobby', className: 'lobby-night' },
];

export const RoomWidgetViewNight: FC<{}> = () => {
  const hotelViewConfig = GetConfiguration('hotelview');

  const handleRoomClick = (roomId: string) => {
    CreateLinkEvent(`navigator/goto/${roomId}`);
  };

  return (
    <Flex>
      {rooms.map((room) => (
        <Base
          key={room.id}
          className={`position-absolute ${room.className}`}
          onClick={() => handleRoomClick(hotelViewConfig[room.id])}
        >
          <i className="active-arrow arrow" />
        </Base>
      ))}
    </Flex>
  );
};