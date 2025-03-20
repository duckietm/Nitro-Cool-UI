import { GetRoomEngine, NitroRectangle, NitroTexture } from '@nitrots/nitro-renderer';
import { FC, useRef } from 'react';
import { LocalizeText, PlaySound, SoundNames } from '../../api';
import { DraggableWindow } from '../draggable-window';

interface LayoutMiniCameraViewProps {
    roomId: number;
    textureReceiver: (texture: NitroTexture) => Promise<void>;
    onClose: () => void;
}

export const LayoutMiniCameraView: FC<LayoutMiniCameraViewProps> = props => {
    const { roomId = -1, textureReceiver = null, onClose = null } = props;
    const elementRef = useRef<HTMLDivElement>();

    const getCameraBounds = () => {
        if (!elementRef || !elementRef.current) return null;

        const frameBounds = elementRef.current.getBoundingClientRect();

        return new NitroRectangle(
            Math.floor(frameBounds.x),
            Math.floor(frameBounds.y),
            Math.floor(frameBounds.width),
            Math.floor(frameBounds.height)
        );
    };

    const takePicture = () => {
        PlaySound(SoundNames.CAMERA_SHUTTER);
        textureReceiver(GetRoomEngine().createTextureFromRoom(roomId, 1, getCameraBounds()));
    };

    return (
        <DraggableWindow handleSelector=".nitro-room-thumbnail-camera">
            <div className="nitro-room-thumbnail-camera px-2">
                <div
                    style={{
                        position: 'relative',
                        paddingBottom: '192px', // Matches the space needed to position buttons as per the design
                    }}
                >
                    <div ref={elementRef} className="camera-frame" />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            right: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <button
                            className="btn btn-sm btn-danger"
                            style={{ width: '80px' }}
                            onClick={onClose}
                        >
                            {LocalizeText('cancel')}
                        </button>
                        <button
                            className="btn btn-sm btn-success"
                            style={{ width: '80px' }}
                            onClick={takePicture}
                        >
                            {LocalizeText('navigator.thumbeditor.save')}
                        </button>
                    </div>
                </div>
            </div>
        </DraggableWindow>
    );
};