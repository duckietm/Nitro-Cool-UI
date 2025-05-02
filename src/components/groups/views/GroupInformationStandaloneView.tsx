import { GroupInformationEvent, GroupInformationParser } from '@nitrots/nitro-renderer';
import { FC, useState } from 'react';
import { LocalizeText } from '../../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../../common';
import { useMessageEvent } from '../../../hooks';
import { GroupInformationView } from './GroupInformationView';

interface GroupInformationStandaloneViewProps
{
    badgeCode?: string;
    isCreating?: boolean;
}

export const GroupInformationStandaloneView: FC<GroupInformationStandaloneViewProps> = props =>
{
    const { badgeCode = null, isCreating = false } = props;
    const [ groupInformation, setGroupInformation ] = useState<GroupInformationParser>(null);

    useMessageEvent<GroupInformationEvent>(GroupInformationEvent, event =>
    {
        // Skip updates during group creation
        if (isCreating) return;

        const parser = event.getParser();

        if((groupInformation && (groupInformation.id === parser.id)) || parser.flag) setGroupInformation(parser);
    });

    if(!groupInformation && !isCreating) return null;

    return (
        <NitroCardView className="nitro-group-information-standalone" theme="primary-slim">
            <NitroCardHeaderView headerText={ LocalizeText('group.window.title') } onCloseClick={ event => setGroupInformation(null) } />
            <NitroCardContentView>
                <GroupInformationView groupInformation={ groupInformation } onClose={ () => setGroupInformation(null) } badgeCode={ badgeCode } />
            </NitroCardContentView>
        </NitroCardView>
    );
};