import { FC } from 'react';
import { Base, Column, Text } from '../../common';

interface LoadingViewProps {
    isError: boolean;
    message: string;
}

export const LoadingView: FC<LoadingViewProps> = props => {
    const { isError = false, message = '' } = props;
    
    return (
        <Column fullHeight position="relative" className="nitro-loading">
            <Base fullHeight className="container h-100">
                <Column fullHeight alignItems="center" justifyContent="center">
                    <Base className="nitro-loading_animation" />
                    <Base className="nitro-loading_logo" />
                    { isError && (message && message.length) ?
                        <Base className="fs-4 nitro-loading_text">{ message }</Base>
                        :
                        <Text fontSizeCustom={32} variant="white" className="nitro-loading_text">
                            The hotel is loading ...
                        </Text>
                    }
                </Column>
            </Base>
        </Column>
    );
};