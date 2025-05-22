import { GetSessionDataManager, HabboClubLevelEnum} from '@nitrots/nitro-renderer';
import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from 'react';
import { Base, Grid, Flex, NitroCardView, NitroCardHeaderView, NitroCardTabsView, NitroCardTabsItemView, NitroCardContentView, Text, LayoutCurrencyIcon } from '../../common';
import { useRoom } from '../../hooks';
import { GetClubMemberLevel, GetConfigurationValue } from '../../api';

interface ItemData { 
    id: number;
    isHcOnly: boolean;
    minRank: number;
    isAmbassadorOnly: boolean;
    selectable: boolean;
}

interface BackgroundsViewProps {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    selectedBackground: number;
    setSelectedBackground: Dispatch<SetStateAction<number>>;
    selectedStand: number;
    setSelectedStand: Dispatch<SetStateAction<number>>;
    selectedOverlay: number;
    setSelectedOverlay: Dispatch<SetStateAction<number>>;
}

const TABS = ['backgrounds', 'stands', 'overlays'] as const;
type TabType = typeof TABS[number];

export const BackgroundsView: FC<BackgroundsViewProps> = ({
    setIsVisible,
    selectedBackground,
    setSelectedBackground,
    selectedStand,
    setSelectedStand,
    selectedOverlay,
    setSelectedOverlay
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('backgrounds');
    const { roomSession } = useRoom();
    
    const userData = useMemo(() => ({
        isHcMember: GetClubMemberLevel() >= HabboClubLevelEnum.CLUB,
        securityLevel: GetSessionDataManager().canChangeName,
        isAmbassador: GetSessionDataManager().isAmbassador
    }), []);

    const processData = useCallback((configData: any[], dataType: string): ItemData[] => {
        if (!configData?.length) return [];
        
        return configData
            .filter(item => {
                const meetsRank = userData.securityLevel >= item.minRank;
                const ambassadorEligible = !item.isAmbassadorOnly || userData.isAmbassador;
                return item.isHcOnly || (meetsRank && ambassadorEligible);
            })
            .map(item => ({ id: item[`${dataType}Id`], ...item, selectable: !item.isHcOnly || userData.isHcMember }));
    }, [userData]);

    const allData = useMemo(() => ({
        backgrounds: processData(GetConfigurationValue('backgrounds.data'), 'background'),
        stands: processData(GetConfigurationValue('stands.data'), 'stand'),
        overlays: processData(GetConfigurationValue('overlays.data'), 'overlay')
    }), [processData]);

    const handleSelection = useCallback((id: number) => {
        if (!roomSession) return;

        const setters = { backgrounds: setSelectedBackground, stands: setSelectedStand, overlays: setSelectedOverlay };
        
        const currentValues = { backgrounds: selectedBackground, stands: selectedStand, overlays: selectedOverlay };

        setters[activeTab](id);
        const newValues = { ...currentValues, [activeTab]: id };
        roomSession.sendBackgroundMessage( newValues.backgrounds, newValues.stands, newValues.overlays );
    }, [activeTab, roomSession, selectedBackground, selectedStand, selectedOverlay, setSelectedBackground, setSelectedStand, setSelectedOverlay]);

    const renderItem = useCallback((item: ItemData, type: string) => (
        <Flex
            pointer
            position="relative"
            key={item.id}
            onClick={() => item.selectable && handleSelection(item.id)}
            className={item.selectable ? '' : 'non-selectable'}
        >
            <Base className={`profile-${type} ${type}-${item.id}`} />
            {item.isHcOnly && <LayoutCurrencyIcon position="absolute" className="top-1 end-1" type="hc" />}
        </Flex>
    ), [handleSelection]);

    return (
        <NitroCardView uniqueKey="backgrounds" className="absolute min-w-[535px] max-w-[535px] min-h-[389px] max-h-[389px]">
            <NitroCardHeaderView headerText="Profile Background" onCloseClick={() => setIsVisible(false)} />
            <NitroCardTabsView>
                {TABS.map(tab => (
                    <NitroCardTabsItemView
                        key={tab}
                        isActive={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </NitroCardTabsItemView>
                ))}
            </NitroCardTabsView>
            <NitroCardContentView gap={1}>
                <Text bold center>Select an Option</Text>
                <Grid gap={1} columnCount={7} overflow="auto">
                    {allData[activeTab].map(item => renderItem(item, activeTab.slice(0, -1)))}
                </Grid>
            </NitroCardContentView>
        </NitroCardView>
    );
};