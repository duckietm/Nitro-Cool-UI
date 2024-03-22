import { FC, useEffect, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { MdFormatColorText } from 'react-icons/md';
import { allowedColours } from '../../../../api';
import { AutoGrid, Base, LayoutGridItem, NitroCardContentView } from '../../../../common';

interface ChatInputColorSelectorViewProps
{
    chatColour: string;
    selectColour: (color: string) => void;
}

export const ChatInputColorSelectorView: FC<ChatInputColorSelectorViewProps> = props =>
{
    const { chatColour = 'black', selectColour = null } = props;
    const [ selectorVisible, setSelectorVisible ] = useState(false);
    const [ colours, setColours ] = useState<Map<string, string>>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => 
    {
		const excludedColors = new Set(["r", "b", "g", "y", "w", "o", "c", "br", "pr", "pk"]);
        const uniqueColours = new Map<string, string>();
		
		allowedColours.forEach((value, key) => {
			if (!excludedColors.has(key) && !Array.from(uniqueColours.values()).includes(value)) {
				uniqueColours.set(key, value);
			}
		});
		
		setColours(uniqueColours);
	}, []);

    const selectColor = (color: string) =>
    {
        selectColour(color);
        setSelectorVisible(false);
    }

    const toggleSelector = () =>
    {
        setSelectorVisible(prevValue => !prevValue);
    }

    return (
        <>
            <Base pointer onClick={ () => toggleSelector() } innerRef={ iconRef } style={ { color: (colours && colours.get(chatColour)) ?? 'black' } }>
                <MdFormatColorText />
            </Base>
            <Overlay show={ selectorVisible } target={ iconRef } placement="top">
                <Popover className="nitro-chat-style-selector-container">
                    <NitroCardContentView overflow="hidden" className="bg-transparent colour-container image-rendering-pixelated">
                        <AutoGrid gap={ 1 } columnCount={ 6 } columnMinWidth={ 20 } columnMinHeight={ 20 }>
                            { colours && (colours.size > 0) && Array.from(colours).map(([ color, hex ]) =>
                            {
                                return (
                                    <LayoutGridItem itemHighlight itemColor={ hex } itemActive={ chatColour === color } className="clear-bg" onClick={ event => selectColor(color) } key={ color }></LayoutGridItem>
                                );
                            }) }
                        </AutoGrid>
                    </NitroCardContentView>
                </Popover>
            </Overlay>
        </>
    );
}
