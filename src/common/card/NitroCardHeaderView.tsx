import { FC, MouseEvent, useMemo } from 'react';
import { FaFlag, FaTimes } from 'react-icons/fa';
import { Base, Column, ColumnProps, Flex } from '..';

interface NitroCardHeaderViewProps extends ColumnProps
{
    headerText: string;
    isGalleryPhoto?: boolean;
    noCloseButton?: boolean;
    isInfoToHabboPages?: boolean;
    hideButtonClose?: boolean;
    onReportPhoto?: (event: MouseEvent) => void;
    onClickInfoHabboPages?: (event: MouseEvent) => void;
    onCloseClick: (event: MouseEvent) => void;
}

export const NitroCardHeaderView: FC<NitroCardHeaderViewProps> = props =>
{
    const { headerText = null, isGalleryPhoto = false, noCloseButton = false, isInfoToHabboPages = false, hideButtonClose = false, onReportPhoto = null, onClickInfoHabboPages = null, onCloseClick = null, justifyContent = 'center', alignItems = 'center', classNames = [], children = null, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'drag-handler', 'container-fluid', 'nitro-card-header' ];

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames ]);

    const onMouseDown = (event: MouseEvent<HTMLDivElement>) =>
    {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    }

    return (
        <Column center position="relative" classNames={ getClassNames } { ...rest }>
            <Flex fullWidth center className="nitro-card-header-holder">
                <span className="nitro-card-header-text">{ headerText }</span>
                { isGalleryPhoto &&
                    <Base position="absolute" className="end-4 nitro-card-header-report-camera" onClick={ onReportPhoto }>
                        <FaFlag className="fa-icon" />
                    </Base>
                }
                { isInfoToHabboPages &&
                    <Base position="absolute" className="end-6 nitro-card-header-info-habbopages" onClick={ onClickInfoHabboPages }></Base>
                }
                <Flex center position="absolute" className="end-2 nitro-card-header-close" onMouseDownCapture={ onMouseDown } onClick={ onCloseClick }>
                    { (!hideButtonClose) && <FaTimes className="fa-icon w-12 h-12" /> }
                </Flex>
            </Flex>
        </Column>
    );
}
