import { NitroConfiguration, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useState, useCallback } from 'react';
import { GetConfiguration} from '../../api';
import { useRoomSessionManagerEvent, useSessionInfo } from '../../hooks';
import { WidgetSlotView } from './views/widgets/WidgetSlotView';


const widgetSlotCount = 7;

export const WidgetView: FC<{}> = () => {
    const [isVisible, setIsVisible] = useState(true);

    useRoomSessionManagerEvent<RoomSessionEvent>(
        [RoomSessionEvent.CREATED, RoomSessionEvent.ENDED],
        (event) => {
            switch (event.type) {
                case RoomSessionEvent.CREATED:
                    setIsVisible(false);
                    return;
                case RoomSessionEvent.ENDED:
                    setIsVisible(event.openLandingView);
                    return;
            }
        }
    );

    if (!isVisible) return null;

    const config = GetConfiguration('hotelview');

    const backgroundColor = config['images']['background.colour'];
    const assetUrl = GetConfiguration<string>('asset.url');

    const renderWidgetSlot = (slot: number) => (
		<WidgetSlotView
			key={slot}
			widgetSlot={slot}
			widgetType={config['widgets'][`slot.${slot}.widget`]}
			widgetConf={config['widgets'][`slot.${slot}.conf`]}
			className={slot === 6 ? 'mt-auto' : slot % 2 === 0 ? 'col-5' : 'col-7'}
		/>
	);

    const widgetSlots = [1, 2, 3, 4, 5, 6, 7].map((slot) => renderWidgetSlot(slot));

    return (
        <div className="nitro-hotel-view" style={backgroundColor ? { background: backgroundColor } : {}}>
            <div className="container h-100 py-3 overflow-hidden landing-widgets">
                <div className="row h-100">
                    <div className="col-9 h-100 d-flex flex-column">
                        {widgetSlots.slice(0, 6)}
                    </div>
                    <div className="col-3 h-100">
                        {widgetSlots[6]}
                    </div>
                </div>
            </div>
        </div>
    );
};