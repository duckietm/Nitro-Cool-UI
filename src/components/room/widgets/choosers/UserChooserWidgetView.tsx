import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect } from 'react';
import { AddEventLinkTracker, LocalizeText, RemoveLinkEventTracker, chooserSelectionVisualizer } from '../../../../api';
import { useUserChooserWidget, useRoom } from '../../../../hooks';
import { ChooserWidgetView } from './ChooserWidgetView';

export const UserChooserWidgetView: FC<{}> = props =>
{
    const { items = null, onClose = null, selectItem = null, populateChooser = null } = useUserChooserWidget();
    const { roomSession = null } = useRoom();

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                populateChooser();
            },
            eventUrlPrefix: 'user-chooser/'
        };

        AddEventLinkTracker(linkTracker);

        return () => {
            chooserSelectionVisualizer.clearAll();
            RemoveLinkEventTracker(linkTracker);
        };
    }, [ populateChooser ]);
    
    if (!items) return null;

    return <ChooserWidgetView 
        title={ LocalizeText('widget.chooser.user.title') }
        items={ items } 
        selectItem={ selectItem } 
        onClose={ () => {
            chooserSelectionVisualizer.clearAll();
            onClose();
        }} 
        pickallFurni={ false }
        type="users"
    />;
}