import { FC } from 'react';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import { Button } from './Button';
import { Flex } from './Flex';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

export interface SliderProps extends ReactSliderProps
{
    disabledButton?: boolean;
}

export const Slider: FC<SliderProps> = props =>
{
    const { disabledButton, max, min, value, onChange, ...rest } = props;

    return <Flex fullWidth gap={ 1 }>
        { !disabledButton && <Button disabled={ min >= value } onClick={ () => onChange(min < value ? value - 1 : min, 0) }><FaAngleLeft /></Button> }
        <ReactSlider className={ 'nitro-slider' } max={ max } min={ min } value={ value } onChange={ onChange } { ...rest } />
        { !disabledButton && <Button disabled={ max <= value } onClick={ () => onChange(max > value ? value + 1 : max, 0) }><FaAngleRight /></Button> }
    </Flex>;
}
