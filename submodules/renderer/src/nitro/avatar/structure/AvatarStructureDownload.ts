import { IFigureSetData, NitroLogger } from '../../../api';
import { EventDispatcher } from '../../../core';
import { NitroEvent } from '../../../events';

export class AvatarStructureDownload extends EventDispatcher
{
    public static AVATAR_STRUCTURE_DONE: string = 'AVATAR_STRUCTURE_DONE';

    private _dataReceiver: IFigureSetData;

    constructor(downloadUrl: string, dataReceiver: IFigureSetData)
    {
        super();

        this._dataReceiver = dataReceiver;

        this.download(downloadUrl);
    }

    private download(url: string): void
    {
        fetch(url)
            .then(response => response.json())
            .then(data =>
            {
                if(this._dataReceiver) this._dataReceiver.appendJSON(data);

                this.dispatchEvent(new NitroEvent(AvatarStructureDownload.AVATAR_STRUCTURE_DONE));
            })
            .catch(err => NitroLogger.error(err));
    }
}
