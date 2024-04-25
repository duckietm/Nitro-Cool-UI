import { FC } from 'react';
import { GetRendererVersion, GetUIVersion, NotificationAlertItem } from '../../../../api';
import { Button, Column, Flex, Grid, LayoutNotificationCredits, LayoutNotificationAlertViewProps, Text } from '../../../../common';

interface NotificationDefaultAlertViewProps extends LayoutNotificationAlertViewProps
{
    item: NotificationAlertItem;
}

export const NitroSystemAlertView: FC<NotificationDefaultAlertViewProps> = props =>
{
    const { title = 'Nitro Cool UI Edit', onClose = null, ...rest } = props;

    return (
        <LayoutNotificationCredits title={ title } onClose={ onClose } { ...rest }>
            <Grid>
                <Column size={ 12 }>
                    <Column alignItems="center" gap={ 0 }>
                        <Text bold fontSize={ 4 }>Nitro React</Text>
                        <Text>v{ GetUIVersion() }</Text>
                    </Column>
                    <Column alignItems="center">
                        <Text><b>Renderer:</b> v{ GetRendererVersion() }</Text>
                        <Column fullWidth gap={ 1 }>
                            <Button fullWidth variant="success" onClick={ event => window.open('https://discord.nitrodev.co') }>Nitro Discord</Button>
                            <Flex gap={ 1 }>
                                <Button fullWidth onClick={ event => window.open('https://git.krews.org/nitro/nitro-react') }>Nitro Git</Button>
                                <Button fullWidth onClick={ event => window.open('https://git.krews.org/nitro/nitro-react/-/issues') }>Nitro Bug Report</Button>
                            </Flex>
                        </Column>
                    </Column>
                </Column>
				<div className="nitro-coolui-logo"></div>
                <Column size={ 10 }>
                    <Column alignItems="left" gap={ 0 }>
                        <Text center bold fontSize={ 5 }>Cool UI</Text>
                        <Text>Was created by Wassehk</Text>
						<Text>- DuckieTM (Re-Design)</Text>
						<Text>- Jonas (Contributing)</Text>
						<Text>- Ohlucas (Sunset resources)</Text>
						<Text center bold small>v1.2.0</Text>
						<Button fullWidth onClick={ event => window.open('https://github.com/duckietm/Nitro-Cool-UI') }>Cool UI Git</Button>
                    </Column>
                </Column>
            </Grid>
        </LayoutNotificationCredits>
    );
}