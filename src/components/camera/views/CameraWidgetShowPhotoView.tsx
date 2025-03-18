import { GetRoomEngine, RoomObjectCategory, RoomObjectVariable } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { GetUserProfile, IPhotoData, LocalizeText } from '../../../api';
import { Flex, Grid, Text } from '../../../common';

export interface CameraWidgetShowPhotoViewProps {
    currentIndex: number;
    currentPhotos: IPhotoData[];
    onClick?: () => void;
}

export const CameraWidgetShowPhotoView: FC<CameraWidgetShowPhotoViewProps> = props => {
    const { currentIndex = -1, currentPhotos = null, onClick = null } = props;
    const [imageIndex, setImageIndex] = useState(0);

    const currentImage = currentPhotos && currentPhotos.length ? currentPhotos[imageIndex] : null;

    const next = () => {
        setImageIndex(prevValue => {
            let newIndex = prevValue + 1;
            if (newIndex >= currentPhotos.length) newIndex = 0;
            return newIndex;
        });
    };

    const previous = () => {
        setImageIndex(prevValue => {
            let newIndex = prevValue - 1;
            if (newIndex < 0) newIndex = currentPhotos.length - 1;
            return newIndex;
        });
    };

    useEffect(() => {
        setImageIndex(currentIndex);
    }, [currentIndex]);

    if (!currentImage) return null;
	
	const getUserData = (roomId: number, objectId: number, type: string): number | string =>
    {
        const roomObject = GetRoomEngine().getRoomObject(roomId, objectId, RoomObjectCategory.WALL);
        if (!roomObject) return;
        return type == 'username' ? roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_OWNER_NAME) : roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_OWNER_ID);
    }

    return (
        <Grid style={{ display: 'flex', flexDirection: 'column' }}>
            <Flex center className="picture-preview border border-black" style={currentImage.w ? { backgroundImage: 'url(' + currentImage.w + ')' } : {}} onClick={onClick}>
                {!currentImage.w && <Text bold>{LocalizeText('camera.loading')}</Text>}
            </Flex>
            {currentImage.m && currentImage.m.length && <Text center>{currentImage.m}</Text>}
            <div className="flex items-center center justify-between">
                <Text>{currentImage.n || ''}</Text>
				<Text onClick={() => GetUserProfile(Number(getUserData(currentImage.s, Number(currentImage.u), 'id')))}> { getUserData(currentImage.s, Number(currentImage.u), 'username') } </Text>
				<Text className="cursor-pointer" onClick={() => GetUserProfile(currentImage.oi)}>{currentImage.o}</Text>
                <Text>{new Date(currentImage.t * 1000).toLocaleDateString()}</Text>				
            </div>
            {currentPhotos.length > 1 && (
                <Flex className="picture-preview-buttons">
                    <FaArrowLeft  onClick={previous} />					
                    <FaArrowRight className="cursor-pointer"onClick={next} />
                </Flex>
            )}
        </Grid>
    );
};