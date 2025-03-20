import { FC, useMemo } from 'react';
import { Base, BaseProps } from './Base';
import { ColorVariantType, FontSizeType, FontWeightType, TextAlignType } from './types';

export interface TextProps extends BaseProps<HTMLDivElement> {
    variant?: ColorVariantType;
    fontWeight?: FontWeightType;
    fontSize?: FontSizeType;
    fontSizeCustom?: number;
    align?: TextAlignType;
    bold?: boolean;
    underline?: boolean;
    italics?: boolean;
    truncate?: boolean;
    center?: boolean;
    textEnd?: boolean;
    small?: boolean;
    wrap?: boolean;
    noWrap?: boolean;
    textBreak?: boolean;
}

export const Text: FC<TextProps> = props => {
    const {
        variant = 'black',
        fontWeight = null,
        fontSize = 0,
        fontSizeCustom,
        align = null,
        bold = false,
        underline = false,
        italics = false,
        truncate = false,
        center = false,
        textEnd = false,
        small = false,
        wrap = false,
        noWrap = false,
        textBreak = false,
        ...rest
    } = props;

    const getClassNames = useMemo(() => {
        const newClassNames: string[] = ['inline'];

        if (variant) {
			if (variant === 'primary') newClassNames.push('text-[#1e7295]');
			if (variant == 'secondary') newClassNames.push('text-[#185d79]');
			if (variant === 'black') newClassNames.push('text-[#000000]');
			if (variant == 'dark') newClassNames.push('text-[#18181b]');
			if (variant === 'gray') newClassNames.push('text-[#6b7280]');
			if (variant === 'white') newClassNames.push('text-[#ffffff]');
			if (variant == 'success') newClassNames.push('text-[#00800b]');
			if (variant == 'danger') newClassNames.push('text-[#a81a12]');
			if (variant == 'warning') newClassNames.push('text-[#ffc107]');
		}
		
        if (bold) newClassNames.push('font-bold');
        if (fontWeight) newClassNames.push('font-' + fontWeight);
        if (fontSize) newClassNames.push('fs-' + fontSize);
        if (fontSizeCustom) newClassNames.push('fs-custom');
        if (align) newClassNames.push('text-' + align);
        if (underline) newClassNames.push('underline');
        if (italics) newClassNames.push('italic');
        if (truncate) newClassNames.push('text-truncate');
        if (center) newClassNames.push('text-center');
        if (textEnd) newClassNames.push('text-end');
        if (small) newClassNames.push('text-sm');
        if (wrap) newClassNames.push('text-wrap');
        if (noWrap) newClassNames.push('text-nowrap');
        if (textBreak) newClassNames.push('text-break');

        return newClassNames;
    }, [variant, fontWeight, fontSize, fontSizeCustom, align, bold, underline, italics, truncate, center, textEnd, small, wrap, noWrap, textBreak]);

    const style = fontSizeCustom ? { '--font-size': `${fontSizeCustom}px` } as React.CSSProperties : undefined;

    return <Base classNames={getClassNames} style={style} {...rest} />;
};