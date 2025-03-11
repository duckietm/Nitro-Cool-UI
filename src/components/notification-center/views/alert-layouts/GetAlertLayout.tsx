import { NotificationAlertItem, NotificationAlertType } from '../../../../api';
import { NitroSystemAlertView } from './NitroSystemAlertView';
import { NotificationDefaultAlertView } from './NotificationDefaultAlertView';
import { NotificationSeachAlertView } from './NotificationSearchAlertView';

export const GetAlertLayout = (item: NotificationAlertItem, onClose: () => void) =>
{
    if(!item) return null;

    const key = item.id;
    const props = { item, onClose };

    switch(item.alertType)
    {
        case NotificationAlertType.NITRO:
            return <NitroSystemAlertView key={key} {...props} />;
        case NotificationAlertType.SEARCH:
            return <NotificationSeachAlertView key={key} {...props} />;
        default:
            return <NotificationDefaultAlertView key={key} {...props} />;
    }
};
