import { ClientJS } from 'clientjs';
import { IConnection, INitroCommunicationDemo, INitroCommunicationManager, NitroConfiguration, NitroLogger, } from '../../api';
import { NitroManager } from '../../core';
import { NitroCommunicationDemoEvent, SocketConnectionEvent, } from '../../events';
import { GetTickerTime } from '../../pixi-proxy';
import { Nitro } from '../Nitro';
import { AuthenticatedEvent, ClientHelloMessageComposer, ClientPingEvent, InfoRetrieveMessageComposer, PongMessageComposer, SSOTicketMessageComposer, UniqueIDMessageComposer, } from './messages';

export class NitroCommunicationDemo extends NitroManager implements INitroCommunicationDemo
{
    private _communication: INitroCommunicationManager;

    private _handShaking: boolean;
    private _didConnect: boolean;

    private _pongInterval: any;

    constructor(communication: INitroCommunicationManager)
	{
        super();

        this._communication = communication;

        this._handShaking = false;
        this._didConnect = false;

        this._pongInterval = null;

        this.onConnectionOpenedEvent = this.onConnectionOpenedEvent.bind(this);
        this.onConnectionClosedEvent = this.onConnectionClosedEvent.bind(this);
        this.onConnectionErrorEvent = this.onConnectionErrorEvent.bind(this);
        this.sendPong = this.sendPong.bind(this);
    }

    protected onInit(): void
	{
        const connection = this._communication.connection;

        if(connection)
		{
            connection.addEventListener(SocketConnectionEvent.CONNECTION_OPENED, this.onConnectionOpenedEvent);
            connection.addEventListener(SocketConnectionEvent.CONNECTION_CLOSED, this.onConnectionClosedEvent);
            connection.addEventListener(SocketConnectionEvent.CONNECTION_ERROR, this.onConnectionErrorEvent);
        }

        this._communication.registerMessageEvent(new ClientPingEvent(this.onClientPingEvent.bind(this)));
        this._communication.registerMessageEvent(new AuthenticatedEvent(this.onAuthenticatedEvent.bind(this)));
    }

    protected onDispose(): void
	{
        const connection = this._communication.connection;

        if(connection)
        {
            connection.removeEventListener(SocketConnectionEvent.CONNECTION_OPENED, this.onConnectionOpenedEvent);
            connection.removeEventListener(SocketConnectionEvent.CONNECTION_CLOSED, this.onConnectionClosedEvent);
            connection.removeEventListener(SocketConnectionEvent.CONNECTION_ERROR, this.onConnectionErrorEvent);
        }

        this._handShaking = false;

        this.stopPonging();

        super.onDispose();
    }

    private onConnectionOpenedEvent(event: Event): void
	{
        const connection = this._communication.connection;

        if(!connection) return;

        this._didConnect = true;

        this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_ESTABLISHED, connection);

        if (NitroConfiguration.getValue<boolean>('system.pong.manually', false)) this.startPonging();

        this.startHandshake(connection);

        connection.send(new ClientHelloMessageComposer(null, null, null, null));

        this.tryAuthentication(connection);
    }

    private onConnectionClosedEvent(event: CloseEvent): void
	{
        const connection = this._communication.connection;

        if(!connection) return;

        this.stopPonging();

        if(this._didConnect) this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_CLOSED, connection);
    }

    private onConnectionErrorEvent(event: CloseEvent): void
	{
        const connection = this._communication.connection;

        if(!connection) return;

        this.stopPonging();

        this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_ERROR, connection);
    }

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
		const e = document.createElement('canvas'), t = e.getContext('2d'), userAgent = navigator.userAgent, screenInfo = '${window.screen.width}x${window.screen.height}', currentDate = new Date().toString(), s = 'ThiosIsVerrySeCuRe02938883721##@@@_moreStuff! | ${userAgent} | ${screenInfo} | ${currentDate}';
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

    private tryAuthentication(connection: IConnection): void
	{
        if(!connection || !this.getSSO()) {
            if (!this.getSSO()) {
                NitroLogger.error('Login without an SSO ticket is not supported');
            }

            this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_HANDSHAKE_FAILED, connection);

            return;
        }

        // Fingerprinter.
        const fp = new ClientJS();

        // Browser.
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
		this.getCanvas());

        const machineId = uniqueId == null ? 'FAILED' : `IID-${uniqueId}`;

        connection.send(
            new SSOTicketMessageComposer(this.getSSO(), GetTickerTime())
        );
        connection.send(new UniqueIDMessageComposer(machineId, '', ''));
    }

    private onClientPingEvent(event: ClientPingEvent): void
	{
        if(!event || !event.connection) return;

        this.sendPong(event.connection);
    }

    private onAuthenticatedEvent(event: AuthenticatedEvent): void
	{
        if(!event || !event.connection) return;

        this.completeHandshake(event.connection);

        this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, event.connection);

        event.connection.send(new InfoRetrieveMessageComposer());
    }

    private startHandshake(connection: IConnection): void
	{
        this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_HANDSHAKING, connection);

        this._handShaking = true;
    }

    private completeHandshake(connection: IConnection): void
	{
        this.dispatchCommunicationDemoEvent(NitroCommunicationDemoEvent.CONNECTION_HANDSHAKED, connection);

        this._handShaking = false;
    }

    private startPonging(): void
	{
        this.stopPonging();

        this._pongInterval = window.setInterval(this.sendPong, NitroConfiguration.getValue<number>('system.pong.interval.ms', 20000));
    }

    private stopPonging(): void
	{
        if(!this._pongInterval) return;

        clearInterval(this._pongInterval);

        this._pongInterval = null;
    }

    private sendPong(connection: IConnection = null): void
	{
        connection = connection || this._communication.connection || null;

        if(!connection) return;

        connection.send(new PongMessageComposer());
    }

    private dispatchCommunicationDemoEvent (type: string, connection: IConnection): void
	{
        Nitro.instance.events.dispatchEvent(new NitroCommunicationDemoEvent(type, connection));
    }

    private getSSO(): string
	{
        return NitroConfiguration.getValue('sso.ticket', null);
    }
}