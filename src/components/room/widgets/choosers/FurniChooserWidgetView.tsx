import { AddLinkEventTracker, ILinkEventTracker, RemoveLinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect } from 'react';
import { LocalizeText } from '../../../../api';
import { useFurniChooserWidget, useRoom } from '../../../../hooks';
import { ChooserWidgetView } from './ChooserWidgetView';

export const FurniChooserWidgetView: FC<{}> = props => {
    const { items = null, onClose = null, selectItem = null, populateChooser = null } = useFurniChooserWidget();
    const { roomSession = null } = useRoom();

    useEffect(() => {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) => {
                const parts = url.split('/');
                populateChooser();
            },
            eventUrlPrefix: 'furni-chooser/'
        };

        AddLinkEventTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ populateChooser ]);

    if (!items) return null;

    return (
        <ChooserWidgetView className="w-[200px] h-[200px]" items={ items } selectItem={ selectItem } title={ LocalizeText('widget.chooser.furni.title') } onClose={ onClose } pickallFurni={ roomSession?.isRoomOwner } />
    );
};