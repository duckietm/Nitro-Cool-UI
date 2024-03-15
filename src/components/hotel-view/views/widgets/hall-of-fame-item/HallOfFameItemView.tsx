import { HallOfFameEntryData } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { GetUserProfile, LocalizeFormattedNumber, LocalizeText } from '../../../../../api';
import { Base, LayoutAvatarImageView } from '../../../../../common';

export interface HallOfFameItemViewProps
{
    data: HallOfFameEntryData;
    goalCode: string;
}

export const HallOfFameItemView: FC<HallOfFameItemViewProps> = props =>
{
    const { data = null, goalCode = null } = props;

    return (
        <div className="hof-user-container">
            <div className="hof-tooltip px-2">
                <Base className="icon icon-sheet" />
                <b className="text-black cursor-pointer px-2" onClick={ () => GetUserProfile(data.userId) }>{ data.userName }</b>
                <div className="small text-black text-muted fw-bold">{ LocalizeText('landing.view.competition.hof.points', [ 'points' ], [ LocalizeFormattedNumber(data.currentScore).toString() ]) } points</div>
                <div className="small text-black text-muted">{ LocalizeText(`landing.view.competition.hof.${ goalCode }.rankdesc.leader`) }</div>
            </div>
            <LayoutAvatarImageView figure={ data.figure } direction={ 2 } />
        </div>
    );
}
