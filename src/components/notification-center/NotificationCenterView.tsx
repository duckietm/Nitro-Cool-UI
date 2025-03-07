import { FC, ReactNode, useMemo } from 'react';
import { NotificationBubbleType } from '../../api';
import { Column } from '../../common';
import { useNotification } from '../../hooks';
import { GetAlertLayout } from './views/alert-layouts/GetAlertLayout';
import { GetBubbleLayout } from './views/bubble-layouts/GetBubbleLayout';
import { GetConfirmLayout } from './views/confirm-layouts/GetConfirmLayout';

export const NotificationCenterView: FC<{}> = props =>
{
    const { alerts = [], bubbleAlerts = [], confirms = [], closeAlert = null, closeBubbleAlert = null, closeConfirm = null } = useNotification();

    const getAlerts = useMemo(() =>
    {
        if(!alerts || !alerts.length) return null;

        return alerts.map((alert) => GetAlertLayout(alert, () => closeAlert(alert)));
    }, [ alerts, closeAlert ]);

    const getBubbleAlerts = useMemo(() =>
    {
        if(!bubbleAlerts || !bubbleAlerts.length) return null;

        return bubbleAlerts.map((alert) => {
            const element = GetBubbleLayout(alert, () => closeBubbleAlert(alert));
            if(alert.notificationType === NotificationBubbleType.CLUBGIFT)
            {
                return element;
            }
            return element;
        });
    }, [ bubbleAlerts, closeBubbleAlert ]);

    const getConfirms = useMemo(() =>
    {
        if(!confirms || !confirms.length) return null;

        return confirms.map((confirm) => GetConfirmLayout(confirm, () => closeConfirm(confirm)));
    }, [ confirms, closeConfirm ]);

    return (
        <>
            <Column gap={ 1 } className="topnotifications">
                { getBubbleAlerts }
            </Column>
            { getConfirms }
            { getAlerts }
        </>
    );
}