import { HabboClubLevelEnum, IAvatarFigureContainer, SaveWardrobeOutfitMessageComposer } from '@nitrots/nitro-renderer';
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { CreateLinkEvent, FigureData, GetAvatarRenderManager, GetClubMemberLevel, GetConfiguration, GetSessionDataManager, LocalizeText, SendMessageComposer } from '../../../api';
import { Flex, LayoutAvatarImageView, LayoutCurrencyIcon } from '../../../common';
export interface AvatarEditorWardrobeViewProps
{
    figureData: FigureData;
    savedFigures: [ IAvatarFigureContainer, string ][];
    setSavedFigures: Dispatch<SetStateAction<[ IAvatarFigureContainer, string][]>>;
    loadAvatarInEditor: (figure: string, gender: string, reset?: boolean) => void;
}

export const AvatarEditorWardrobeView: FC<AvatarEditorWardrobeViewProps> = props =>
{
    const { figureData = null, savedFigures = [], setSavedFigures = null, loadAvatarInEditor = null } = props;

    const hcDisabled = GetConfiguration<boolean>('hc.disabled', false);

    const wearFigureAtIndex = useCallback((index: number) =>
    {
        if((index >= savedFigures.length) || (index < 0)) return;

        const [ figure, gender ] = savedFigures[index];

        loadAvatarInEditor(figure.getFigureString(), gender);
    }, [ savedFigures, loadAvatarInEditor ]);

    const saveFigureAtWardrobeIndex = useCallback((index: number) =>
    {
        if(!figureData || (index >= savedFigures.length) || (index < 0)) return;

        if (GetSessionDataManager().clubLevel === HabboClubLevelEnum.NO_CLUB) return CreateLinkEvent('habboUI/open/hccenter');

        const newFigures = [ ...savedFigures ];

        const figure = figureData.getFigureString();
        const gender = figureData.gender;

        newFigures[index] = [ GetAvatarRenderManager().createFigureContainer(figure), gender ];

        setSavedFigures(newFigures);
        SendMessageComposer(new SaveWardrobeOutfitMessageComposer((index + 1), figure, gender));
    }, [ figureData, savedFigures, setSavedFigures ]);

    const getClubLevel = useCallback(() =>
    {
        let highestClubLevel = 0;

        savedFigures.forEach(([ figureContainer, gender ]) =>
        {
            if (figureContainer)
            {
                const clubLevel = GetAvatarRenderManager().getFigureClubLevel(figureContainer, gender);
                highestClubLevel = Math.max(highestClubLevel, clubLevel);
            }
        });

        return highestClubLevel;
    }, [ savedFigures ]);

    const figures = useMemo(() =>
    {
        if(!savedFigures || !savedFigures.length) return [];

        const items: JSX.Element[] = [];

        savedFigures.forEach(([ figureContainer, gender ], index) =>
        {
            let clubLevel = 0;

            if(figureContainer) clubLevel = GetAvatarRenderManager().getFigureClubLevel(figureContainer, gender);

            items.push(
                <Flex key={ index } alignItems={ 'center' } justifyContent={ 'center' }>
                    <Flex gap={ 1 } column={ true } className="button-container">
                        <button
                            className="saved-outfit-button"
                            onClick={ event => saveFigureAtWardrobeIndex(index) }
                            disabled={ clubLevel > GetClubMemberLevel() && !hcDisabled }>
                            <MdKeyboardArrowRight />
                        </button>
                        { figureContainer && (
                            <button
                                className="saved-outfit-button"
                                onClick={ event => wearFigureAtIndex(index) }
                                disabled={ clubLevel > GetClubMemberLevel() && !hcDisabled }
                            >
                                <MdKeyboardArrowLeft />
                            </button>
                        ) }
                    </Flex>
                    <div className="avatar-container">
                        { figureContainer && (
                            <LayoutAvatarImageView className="avatar-figure" figure={ figureContainer.getFigureString() } gender={ gender } direction={ 4 } />
                        ) }
                    </div>
                </Flex>
            );
        });

        return items;
    }, [ savedFigures, saveFigureAtWardrobeIndex, wearFigureAtIndex ]);

    return (
        <div>
            <div className="d-flex flex-column align-items-center">
                <span className="saved-outfits-title">
                    { LocalizeText('avatareditor.wardrobe.title') }
                </span>
                <span className="mt-2">
                    { !hcDisabled && getClubLevel() > 0 && (
                        <LayoutCurrencyIcon type="hc" />
                    ) }
                </span>
            </div>
            <div className="saved-outfit-container mt-2">
                <div className="nitro-avatar-editor-wardrobe-container">{ figures }</div>
            </div>
        </div>
    );

}
