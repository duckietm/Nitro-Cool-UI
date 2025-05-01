import { FC } from 'react';
import { GetRendererVersion, GetUIVersion, NotificationAlertItem } from '../../../../api';
import { Button, Column, Flex, Grid, LayoutNotificationCredits, LayoutNotificationAlertViewProps, Text } from '../../../../common';

interface NotificationDefaultAlertViewProps extends LayoutNotificationAlertViewProps {
    item: NotificationAlertItem;
}

export const NitroSystemAlertView: FC<NotificationDefaultAlertViewProps> = props => {
    const { title = 'Nitro Cool UI Edit', onClose = null, ...rest } = props;

    return (
        <LayoutNotificationCredits title={title} onClose={onClose} classNames={['nitro-credits']} {...rest}>
            <Grid>
                <Column size={12}>
                    <div className="nitro-logo-default"></div>
                </Column>
                <Column size={10}>
                    <Column alignItems="center" gap={1}>
                        <Text bold fontSize={5}>Nitro React</Text>
                        <Text>Nitro was created by billsonnn</Text>
                        <div className="spacer"></div>
                        <Text>Nitro Versions</Text>
                        <Text><b>Nitro:</b> {GetUIVersion()}</Text>
                    </Column>
                    <Column alignItems="center">
                        <Text><b>Renderer:</b> v{GetRendererVersion()}</Text>
                        <Column fullWidth gap={1}>
                            <Button fullWidth variant="success" onClick={event => window.open('https://discord.nitrodev.co')}>
                                Nitro Discord
                            </Button>
                            <Flex gap={1}>
                                <Button fullWidth onClick={event => window.open('https://git.krews.org/nitro/nitro-react')}>
                                    Nitro Git
                                </Button>
                                <Button fullWidth onClick={event => window.open('https://git.krews.org/nitro/nitro-react/-/issues')}>
                                    Nitro Bug Report
                                </Button>
                            </Flex>
                        </Column>
                    </Column>
                </Column>
                <div className="mysterytrophy-image"></div>
                <Column size={12}>
                    <div className="credits-divider"></div>
                </Column>
                <Column size={12}>
                    <Flex alignItems="center" gap={2}>
                        {/* Logo on the left */}
                        <Column size={6} justifyContent="start">
                            <div className="nitro-coolui-logo"></div>
                        </Column>
                        {/* Text on the right */}
                        <Column size={6} alignItems="left" gap={0}>
                            <Text center bold fontSize={5}>Cool UI</Text>
                            <Text>Was created by Wassehk</Text>
                            <Text>- DuckieTM (Re-Design)</Text>
                            <Text>- Jonas (Contributing)</Text>
                            <Text>- Ohlucas (Sunset resources)</Text>
                            <Text center bold small>v2.0.0</Text>
                            <Button fullWidth onClick={event => window.open('https://github.com/duckietm/Nitro-Cool-UI')}>
                                Cool UI Git
                            </Button>
                        </Column>
                    </Flex>
                </Column>
                <Column size={12}>
                    <div className="credits-divider"></div>
                </Column>
                <Column size={10}>
                    <Column alignItems="center" gap={1}>
                        <Text center bold fontSize={5}>Special Thanks</Text>
                        <Text>The whole Discord community !!</Text>
                        <Text>- Billsonnn for creating Nitro.</Text>
                        <Text>- Remco for testing.</Text>
                        <Text>- Object from Atom.</Text>
                        <Text>- Habbo for providing the assets</Text>
                    </Column>
                </Column>
                <div className="notification-frank"></div>
                <Column size={12}>
                    <div className="credits-divider"></div>
                </Column>
                <Column size={10}>
                    <Column alignItems="center" gap={1}>
                        <Text center bold fontSize={5}>License</Text>
                        <Text center small>
                            This program is free software: you can redistribute it and/or modify
                            it under the terms of the GNU General Public License as published by
                            the Free Software Foundation, either version 3 of the License, or
                            (at your option) any later version.
                        </Text>
                        <Button fullWidth onClick={event => window.open('https://www.gnu.org/licenses/gpl-3.0')}>
                            View Full License
                        </Button>
                    </Column>
                </Column>
            </Grid>
        </LayoutNotificationCredits>
    );
};