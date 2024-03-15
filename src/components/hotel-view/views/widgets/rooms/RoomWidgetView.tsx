import React, { FC } from 'react';
import { CreateLinkEvent, GetConfiguration } from '../../../../../api';
import { Base, Flex } from '../../../../../common';

interface Room {
  id: string;
  className: string;
}

const rooms: Room[] = [
  { id: 'room.rooftop', className: 'rooftop-orange' },
  { id: 'room.rooftop.pool', className: 'rooftop-pool-orange' },
  { id: 'room.pool', className: 'pool-orange' },
  { id: 'room.picnic', className: 'picnic-orange' },
  { id: 'room.peaceful', className: 'peaceful-orange' },
  { id: 'room.infobus', className: 'infobus-orange' },
  { id: 'room.lobby', className: 'lobby' },
];

export const RoomWidgetView: FC<{}> = () => {
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