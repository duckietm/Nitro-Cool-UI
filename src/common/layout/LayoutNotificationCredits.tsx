import { FC, useMemo } from 'react';
import { NotificationAlertType } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView, NitroCardViewProps } from '../card';

export interface LayoutNotificationCreditsProps extends NitroCardViewProps
{
    title?: string;
    type?: string;
    onClose: () => void;
}

export const LayoutNotificationCredits: FC<LayoutNotificationCreditsProps> = props =>
{
    const { title = '', onClose = null, classNames = [], children = null,type = NotificationAlertType.DEFAULT, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = ['nitro-alert', 'nitro-alert-credits'];

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames, type ]);

    return (
        <NitroCardView classNames={ getClassNames } theme="primary" { ...rest }>
            <NitroCardHeaderView headerText={ title } onCloseClick={ onClose } />
            <NitroCardContentView grow justifyContent="between" overflow="hidden" className="text-black" gap={ 0 }>
                { children }
            </NitroCardContentView>
        </NitroCardView>
    );
}
