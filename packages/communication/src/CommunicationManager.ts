import { ICommunicationManager, IConnection, IMessageConfiguration, IMessageEvent } from '@nitrots/api';
import { GetConfiguration } from '@nitrots/configuration';
import { GetEventDispatcher, NitroEventType } from '@nitrots/events';
import { GetTickerTime } from '@nitrots/utils';
import { NitroMessages } from './NitroMessages';
import { SocketConnection } from './SocketConnection';
import { AuthenticatedEvent, ClientHelloMessageComposer, ClientPingEvent, InfoRetrieveMessageComposer, PongMessageComposer, SSOTicketMessageComposer, UniqueIDMessageComposer } from './messages';
import { ClientJS } from 'clientjs';

export class CommunicationManager implements ICommunicationManager
{
    private _connection: IConnection = new SocketConnection();
    private _messages: IMessageConfiguration = new NitroMessages();

    private _pongInterval: any = null;
	
	private getGpu(): string {
        const e = document.createElement('canvas');
        let t, s, i, r;
        try {
            if (
                ((t = e.getContext('webgl') || e.getContext('experimental-webgl')), (s = t.getExtension('WEBGL_debug_renderer_info')), null === t || null === s))
                return '';
        } catch (n) {
            return '';
        }
        return ((i = t.getParameter(s.UNMASKED_VENDOR_WEBGL)), (r = t.getParameter(s.UNMASKED_RENDERER_WEBGL)), i + '|' + r);
    }

    private getMathResult(): string {
        let e, t;
        (e = '<mathroutines>Error</mathroutines>'), (t = '');
        try {
            return (
                (t ='<mathroutines>' + (Math.exp(10) + 1 / Math.exp(10)) / 2 + '|' + Math.tan(-1e300) + '</mathroutines>'), t);
        } catch (s) {
            return '<mathroutines>Error</mathroutines>';
        }
    }
	
	private getCanvas(): any {
		const e = document.createElement('canvas'), t = e.getContext('2d'), userAgent = navigator.userAgent, screenInfo = '${window.screen.width}x${window.screen.height}', currentDate = new Date().toString(), s = 'ThiosIsVerrySeCuRe02938883721moreStuff! | ${userAgent} | ${screenInfo} | ${currentDate}';
		t.textBaseline = 'top';
		t.font = "16px 'Arial'";
		t.textBaseline = 'alphabetic';
		t.rotate(0.05);
		t.fillStyle = '#f60';
		t.fillRect(125, 1, 62, 20);
		t.fillStyle = '#069';
		t.fillText(s, 2, 15);
		t.fillStyle = 'rgba(102, 200, 0, 0.7)';
		t.fillText(s, 4, 17);
		t.shadowBlur = 10;
		t.shadowColor = 'blue';
		t.fillRect(-20, 10, 234, 5);
		const i = e.toDataURL();
		document.body.appendChild(e);
		let r = 0;
		if (i.length === 0) return 'nothing!';
		for (let n = 0; n < i.length; n++) {
			r = (r << 5) - r + i.charCodeAt(n);
			r &= r;
		}
		return r;
	}
	
	private generateMachineID(): string {
        const fp = new ClientJS();
        const uniqueId = fp.getCustomFingerprint(
            fp.getAvailableResolution(), 
            fp.getOS(),
            fp.getCPU(), 
            fp.getColorDepth(), 
            this.getGpu(), 
            fp.getSilverlightVersion(), 
            fp.getOSVersion(), 
            this.getMathResult(), 
            fp.getCanvasPrint(), 
            this.getCanvas()
        );
        return uniqueId == null ? 'FAILED' : `IID-${uniqueId}`;
    }

    constructor()
    {
        this._connection.registerMessages(this._messages);
    }

    public async init(): Promise<void>
    {
        GetEventDispatcher().addEventListener(NitroEventType.SOCKET_CLOSED, () =>
        {
            this.stopPong();
        });

        return new Promise((resolve, reject) =>
        {
            GetEventDispatcher().addEventListener(NitroEventType.SOCKET_OPENED, () =>
            {
                if(GetConfiguration().getValue<boolean>('system.pong.manually', false)) this.startPong();
				
				const machineId = this.generateMachineID();
				
                this._connection.send(new ClientHelloMessageComposer(null, null, null, null));
                this._connection.send(new SSOTicketMessageComposer(GetConfiguration().getValue('sso.ticket', null), GetTickerTime()));
				this._connection.send(new UniqueIDMessageComposer(machineId, '', ''));
            });

            GetEventDispatcher().addEventListener(NitroEventType.SOCKET_ERROR, () =>
            {
                reject();
            });

            this._connection.addMessageEvent(new ClientPingEvent((event: ClientPingEvent) => this.sendPong()));

            this._connection.addMessageEvent(new AuthenticatedEvent((event: AuthenticatedEvent) =>
            {
                this._connection.authenticated();

                resolve();

                event.connection.send(new InfoRetrieveMessageComposer());
            }));

            this._connection.init(GetConfiguration().getValue<string>('socket.url'));
        });
    }

    protected startPong(): void
    {
        if(this._pongInterval) this.stopPong();

        this._pongInterval = setInterval(() => this.sendPong(), GetConfiguration().getValue<number>('system.pong.interval.ms', 20000));
    }

    protected stopPong(): void
    {
        if(!this._pongInterval) return;

        clearInterval(this._pongInterval);

        this._pongInterval = null;
    }

    protected sendPong(): void
    {
        this._connection?.send(new PongMessageComposer());
    }

    public registerMessageEvent(event: IMessageEvent): IMessageEvent
    {
        if(this._connection) this._connection.addMessageEvent(event);

        return event;
    }

    public removeMessageEvent(event: IMessageEvent): void
    {
        if(!this._connection) return;

        this._connection.removeMessageEvent(event);
    }

    public get connection(): IConnection
    {
        return this._connection;
    }
}
