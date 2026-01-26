import { GroupInformationParser, GroupRemoveMemberComposer } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { CatalogPageName, CreateLinkEvent, GetGroupManager, GetGroupMembers, GetSessionDataManager, GroupMembershipType, GroupType, LocalizeText, SendMessageComposer, TryJoinGroup, TryVisitRoom } from '../../../api';
import { Button, Column, Flex, GridProps, LayoutBadgeImageView, Text } from '../../../common';
import { useNotification } from '../../../hooks';

const STATES: string[] = [ 'regular', 'exclusive', 'private' ];

interface GroupInformationViewProps extends GridProps
{
    groupInformation: GroupInformationParser;
    onJoin?: () => void;
    onClose?: () => void;
}

export const GroupInformationView: FC<GroupInformationViewProps> = props =>
{
    const { groupInformation = null, onClose = null, overflow = 'hidden', ...rest } = props;
    const { showConfirm = null } = useNotification();

    const isRealOwner = (groupInformation && (groupInformation.ownerName === GetSessionDataManager().userName));

    const joinGroup = () => (groupInformation && TryJoinGroup(groupInformation.id));

    const leaveGroup = () =>
    {
        showConfirm(LocalizeText('group.leaveconfirm.desc'), () =>
        {
            SendMessageComposer(new GroupRemoveMemberComposer(groupInformation.id, GetSessionDataManager().userId));

            if(onClose) onClose();
        }, null);
    }

    const getRoleIcon = () =>
    {
        if(groupInformation.membershipType === GroupMembershipType.NOT_MEMBER || groupInformation.membershipType === GroupMembershipType.REQUEST_PENDING) return null;

        if(isRealOwner) return <i className="icon icon-group-owner" title={ LocalizeText('group.youareowner') } />;

        if(groupInformation.isAdmin) return <i className="icon icon-group-admin" title={ LocalizeText('group.youareadmin') } />;

        return <i className="icon icon-group-member" title={ LocalizeText('group.youaremember') } />;
    }

    const getButtonText = () =>
    {
        if(isRealOwner) return 'group.youareowner';

        if(groupInformation.type === GroupType.PRIVATE && groupInformation.membershipType !== GroupMembershipType.MEMBER) return '';

        if(groupInformation.membershipType === GroupMembershipType.MEMBER) return 'group.leave';

        if((groupInformation.membershipType === GroupMembershipType.NOT_MEMBER) && groupInformation.type === GroupType.REGULAR) return 'group.join';

        if(groupInformation.membershipType === GroupMembershipType.REQUEST_PENDING) return 'group.membershippending';

        if((groupInformation.membershipType === GroupMembershipType.NOT_MEMBER) && groupInformation.type === GroupType.EXCLUSIVE) return 'group.requestmembership';
    }

    const handleButtonClick = () =>
    {
        if((groupInformation.type === GroupType.PRIVATE) && (groupInformation.membershipType === GroupMembershipType.NOT_MEMBER)) return;

        if(groupInformation.membershipType === GroupMembershipType.MEMBER)
        {
            leaveGroup();

            return;
        }

        joinGroup();
    }

    const handleAction = (action: string) =>
    {
        switch(action)
        {
            case 'members':
                GetGroupMembers(groupInformation.id);
                break;
            case 'members_pending':
                GetGroupMembers(groupInformation.id, 2);
                break;
            case 'manage':
                GetGroupManager(groupInformation.id);
                break;
            case 'homeroom':
                TryVisitRoom(groupInformation.roomId);
                break;
            case 'furniture':
                CreateLinkEvent('catalog/open/' + CatalogPageName.GUILD_CUSTOM_FURNI);
                break;
            case 'popular_groups':
                CreateLinkEvent('navigator/search/groups');
                break;
        }
    }

    if(!groupInformation) return null;

    return (
        <Column className="group-information" overflow={ overflow } { ...rest }>
            <Column className='group-information-content overflow-hidden'>
                <Flex>
                    <Column gap={0} className='badge-container' alignItems='center' overflow="hidden">
                        <Flex className="p-2 pe-3">
                            <Flex alignItems="center" overflow="hidden" className="group-badge">
                                <LayoutBadgeImageView style={ { transform: 'scale(1)' } } badgeCode={ groupInformation.badge } isGroup={ true } scale={ 2 } />
                            </Flex>
                        </Flex>
                        <Column className='me-1' alignItems="center" gap={ 0 }>
                            <Text fontSize={9} small bold underline pointer onClick={ () => handleAction('members') }>{ LocalizeText('group.membercount', [ 'totalMembers' ], [ groupInformation.membersCount.toString() ]) }</Text>
                            { (groupInformation.pendingRequestsCount > 0) &&
                                <Text fontSize={9} small underline pointer onClick={ () => handleAction('members_pending') }>{ LocalizeText('group.pendingmembercount', [ 'amount' ], [ groupInformation.pendingRequestsCount.toString() ]) }</Text> }
                            { groupInformation.isOwner &&
                                <Text fontSize={7} small underline pointer onClick={ () => handleAction('manage') }>{ LocalizeText('group.manage') }</Text> }
                        </Column>
                    </Column>
                    <Column gap={0} justifyContent="between" overflow="auto">
                        <Column gap={0} overflow="hidden">
                            <Column gap={ 0 }>
                                <Flex alignItems="center" gap={ 1 }>
                                    <Flex gap={ 1 }>
                                        <i className={ 'icon icon-group-type-' + groupInformation.type } title={ LocalizeText(`group.edit.settings.type.${ STATES[groupInformation.type] }.help`) } />
                                        { groupInformation.canMembersDecorate &&
                                            <i className="icon icon-group-decorate" title={ LocalizeText('group.memberscandecorate') } /> }
                                    </Flex>
                                    <Text style={ { fontSize: 12.5 } } bold>{ groupInformation.title }</Text>
                                </Flex>
                                <Text fontSize={7} small>{ LocalizeText('group.created', [ 'date', 'owner' ], [ groupInformation.createdAt, groupInformation.ownerName ]) }</Text>
                            </Column>
                            <Text style={ { fontSize: 12.5 } } small textBreak overflow="auto" className="group-description">{ groupInformation.description }</Text>
                        </Column>
                        <Column>
                            <Column className='mt-2' gap={ 0 }>
                                <Text small underline pointer onClick={ () => handleAction('homeroom') }>{ LocalizeText('group.linktobase') }</Text>
                                <Text small underline pointer onClick={ () => handleAction('furniture') }>{ LocalizeText('group.buyfurni') }</Text>
                                <Text small underline pointer onClick={ () => handleAction('popular_groups') }>{ LocalizeText('group.showgroups') }</Text>
                            </Column>
                        </Column>
                    </Column>
                </Flex>
                <Flex className='mt-2' fullWidth center position='relative'>
                    <Flex style={ { left: 35, bottom: 5 } } position='absolute' className='role-icon'>{ getRoleIcon() }</Flex>
                    { (groupInformation.type !== GroupType.PRIVATE || groupInformation.type === GroupType.PRIVATE && groupInformation.membershipType === GroupMembershipType.MEMBER) &&
                        <Button style={ { minWidth: 160, color: 'red', fontSize: '16px'} } variant={(groupInformation.membershipType === GroupMembershipType.REQUEST_PENDING) ? 'transparent' : 'bold'} className='group-button' disabled={ isRealOwner } onClick={ handleButtonClick }>
                            { LocalizeText(getButtonText()) }
                        </Button> }
                </Flex>
            </Column>
        </Column>
    );
};
