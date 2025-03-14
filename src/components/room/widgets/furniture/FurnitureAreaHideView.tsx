import { GetRoomEngine } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { LocalizeText } from '../../../../api';
import { Button, Column, Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../../common';
import { useFurnitureAreaHideWidget } from '../../../../hooks';

export const FurnitureAreaHideView: FC<{}> = props =>
{
    const { objectId = -1, isOn, setIsOn, wallItems, setWallItems, inverted, setInverted, invisibility, setInvisibility, onClose = null } = useFurnitureAreaHideWidget();

    if(objectId === -1) return null;

    return (
        <NitroCardView theme="primary-slim" className="nitro-room-widget-area-hide" style={ { maxWidth: '400px' }}>
            <NitroCardHeaderView headerText={ LocalizeText('widget.areahide.title') } onCloseClick={ onClose } />
            <NitroCardContentView overflow="hidden" justifyContent="between">
                <Column gap={ 2 }>
                    <Column gap={ 1 }>
                        <Text bold>{ LocalizeText('wiredfurni.params.area_selection') }</Text>
                        <Text bold>{ LocalizeText('wiredfurni.params.area_selection.info') }</Text>
                    </Column>
                    <Flex gap={ 1 }>
                        <Button fullWidth variant="primary" onClick={ event => GetRoomEngine().areaSelectionManager.startSelecting() }>
                            { LocalizeText('wiredfurni.params.area_selection.select') }
                        </Button>
                        <Button fullWidth variant="primary" onClick={ event => GetRoomEngine().areaSelectionManager.clearHighlight() }>
                            { LocalizeText('wiredfurni.params.area_selection.clear') }
                        </Button>
                    </Flex>
                </Column>
                <Column gap={ 1 }>
                    <Text bold>{ LocalizeText('widget.areahide.options') }</Text>
                    <Flex gap={ 1 }>
                        <input className="form-check-input" type="checkbox" id="setWallItems" checked={ wallItems } onChange={ event => setWallItems(event.target.checked ? true : false) } />
                        <Text>{ LocalizeText('widget.areahide.options.wallitems') }</Text>
                    </Flex>
                    <Flex gap={ 1 }>
                        <input className="form-check-input" type="checkbox" id="setInverted" checked={ inverted } onChange={ event => setInverted(event.target.checked ? true : false) } />
                        <Column gap={ 1 }>
                            <Text>{ LocalizeText('widget.areahide.options.invert') }</Text>
                            <Text>{ LocalizeText('widget.areahide.options.invert.info') }</Text>
                        </Column>
                    </Flex>
                    <Flex gap={ 1 }>
                        <input className="form-check-input" type="checkbox" id="setInvisibility" checked={ invisibility } onChange={ event => setInvisibility(event.target.checked ? true : false) } />
                        <Column gap={ 1 }>
                            <Text>{ LocalizeText('widget.areahide.options.invisibility') }</Text>
                            <Text>{ LocalizeText('widget.areahide.options.invisibility.info') }</Text>
                        </Column>
                    </Flex>
                </Column>
                <Button fullWidth variant="primary">
                    { LocalizeText(isOn ? 'widget.dimmer.button.off' : 'widget.dimmer.button.on') }
                </Button>
            </NitroCardContentView>
        </NitroCardView>
    );
};