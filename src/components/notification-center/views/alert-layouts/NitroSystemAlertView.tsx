import { FC } from 'react';
import { GetRendererVersion, GetUIVersion, NotificationAlertItem } from '../../../../api';
import { Button, Column, Grid, LayoutNotificationAlertView, LayoutNotificationAlertViewProps, Text } from '../../../../common';

interface NotificationDefaultAlertViewProps extends LayoutNotificationAlertViewProps
{
    item: NotificationAlertItem;
}

export const NitroSystemAlertView: FC<NotificationDefaultAlertViewProps> = props =>
{
    const { title = 'Nitro', onClose = null, ...rest } = props;

    return (
        <LayoutNotificationAlertView title={ title } onClose={ onClose } { ...rest }>
            <Grid>
                <Column size={ 12 }>
                    <Column alignItems="center" gap={ 0 }>
                        <Text bold fontSize={ 4 }>Nitro React</Text>
                        <Text>v{ GetUIVersion() }</Text>
                    </Column>
                    <Column alignItems="center">
                        <Text><b>Renderer:</b> v{ GetRendererVersion() }</Text>
                        <Column fullWidth gap={ 1 }>
                            <Button fullWidth variant="success" onClick={ event => window.open('https://discord.nitrodev.co') }>Discord</Button>
                        </Column>
                    </Column>
					<div className="alertView_nitro-coolui-logo"></div>
					<Column size={ 12 }>
						<Column alignItems="center" gap={ 0 }>
							<Text center bold fontSize={ 5 }>Cool UI</Text>
							<Text>- DuckieTM (Design)</Text>
							<Text center bold small>v3.0.0</Text>
							<Button fullWidth onClick={ event => window.open('https://github.com/duckietm/Nitro-Cool-UI') }>Cool UI Git</Button>
						</Column>
					</Column>
                </Column>
			
            </Grid>
        </LayoutNotificationAlertView>
    );
};
