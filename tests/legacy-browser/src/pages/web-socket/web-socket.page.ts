import { AcWsClient, EventHandler } from "@autocode-ts/ac-ws-client";

export class WebSocketTestPage extends HTMLElement {
    private client: AcWsClient | null = null;
    private chatClient: AcWsClient | null = null;
    private logElement: HTMLElement | null = null;

    connectedCallback() {
        this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">WebSocket Test Client</h2>
        
        <div class="row">
          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-primary text-white">Connection Settings</div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">Server URL</label>
                  <input type="text" id="ws-url" class="form-control" value="ws://localhost:3030">
                </div>
                <div class="d-flex gap-2">
                  <button id="btn-connect" class="btn btn-success">Connect</button>
                  <button id="btn-disconnect" class="btn btn-danger" disabled>Disconnect</button>
                </div>
                <div id="connection-status" class="mt-2 badge bg-secondary">Disconnected</div>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header bg-info text-white">Default Namespace (/)</div>
              <div class="card-body">
                <div class="input-group mb-3">
                  <input type="text" id="msg-input" class="form-control" placeholder="Message content">
                  <button id="btn-send-msg" class="btn btn-primary" disabled>Emit 'message'</button>
                </div>
                <button id="btn-broadcast-req" class="btn btn-outline-info w-100" disabled>Request Broadcast</button>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header bg-warning">Chat Namespace (/chat)</div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">Room</label>
                  <input type="text" id="room-input" class="form-control" value="lobby">
                </div>
                <button id="btn-join-room" class="btn btn-warning w-100 mb-3" disabled>Join Room</button>
                <div class="input-group">
                  <input type="text" id="chat-input" class="form-control" placeholder="Chat message">
                  <button id="btn-send-chat" class="btn btn-dark" disabled>Send Chat</button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Event Log</span>
                <button id="btn-clear-log" class="btn btn-sm btn-outline-secondary">Clear</button>
              </div>
              <div id="ws-log" class="card-body overflow-auto font-monospace" style="max-height: 600px; font-size: 0.85rem; background: #f8f9fa;">
                <div class="text-muted italic">Logs will appear here...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        this.logElement = this.querySelector('#ws-log');
        this.setupEvents();
    }

    private setupEvents() {
        const btnConnect = this.querySelector('#btn-connect') as HTMLButtonElement;
        const btnDisconnect = this.querySelector('#btn-disconnect') as HTMLButtonElement;
        const btnSendMsg = this.querySelector('#btn-send-msg') as HTMLButtonElement;
        const btnBroadcastReq = this.querySelector('#btn-broadcast-req') as HTMLButtonElement;
        const btnJoinRoom = this.querySelector('#btn-join-room') as HTMLButtonElement;
        const btnSendChat = this.querySelector('#btn-send-chat') as HTMLButtonElement;
        const btnClearLog = this.querySelector('#btn-clear-log') as HTMLButtonElement;

        const urlInput = this.querySelector('#ws-url') as HTMLInputElement;
        const msgInput = this.querySelector('#msg-input') as HTMLInputElement;
        const roomInput = this.querySelector('#room-input') as HTMLInputElement;
        const chatInput = this.querySelector('#chat-input') as HTMLInputElement;
        const statusBadge = this.querySelector('#connection-status') as HTMLElement;

        btnConnect.addEventListener('click', async () => {
            const url = urlInput.value;
            this.log(`Connecting to ${url}...`, 'info');

            this.client = new AcWsClient(url);
            this.chatClient = new AcWsClient(url, '/chat');

            // Setup default client
            this.client.on('connect', () => {
                this.log('[/] Connected', 'success');
                statusBadge.textContent = 'Connected';
                statusBadge.className = 'mt-2 badge bg-success';
                btnConnect.disabled = true;
                btnDisconnect.disabled = false;
                btnSendMsg.disabled = false;
                btnBroadcastReq.disabled = false;
            });

            this.client.on('disconnect', () => {
                this.log('[/] Disconnected', 'danger');
                statusBadge.textContent = 'Disconnected';
                statusBadge.className = 'mt-2 badge bg-secondary';
                this.resetUI();
            });

            this.client.on('broadcast_event', (data) => {
                this.log(`[/] Broadcast: ${JSON.stringify(data)}`, 'primary');
            });

            // Setup chat client
            this.chatClient.on('connect', () => {
                this.log('[/chat] Connected', 'success');
                btnJoinRoom.disabled = false;
            });

            this.chatClient.on('joined', (room) => {
                this.log(`[/chat] Joined room: ${room}`, 'warning');
                btnSendChat.disabled = false;
            });

            this.chatClient.on('chat_msg', (data) => {
                this.log(`[/chat] Message from ${data.from}: ${data.msg}`, 'dark');
            });

            await this.client.connect();
            await this.chatClient.connect();
        });

        btnDisconnect.addEventListener('click', () => {
            this.client?.disconnect();
            this.chatClient?.disconnect();
            this.log('Manually disconnected', 'info');
        });

        btnSendMsg.addEventListener('click', async () => {
            const msg = msgInput.value;
            this.log(`[/] Emitting 'hello': ${msg}`, 'secondary');
            const response = await this.client?.emit('hello', msg);
            this.log(`[/] Ack response: ${JSON.stringify(response)}`, 'success');
        });

        btnBroadcastReq.addEventListener('click', () => {
            const msg = "Request from browser";
            this.log(`[/] Requesting broadcast...`, 'secondary');
            this.client?.emit('broadcast_request', msg);
        });

        btnJoinRoom.addEventListener('click', () => {
            const room = roomInput.value;
            this.log(`[/chat] Joining room: ${room}...`, 'secondary');
            this.chatClient?.emit('join', room);
        });

        btnSendChat.addEventListener('click', () => {
            const room = roomInput.value;
            const msg = chatInput.value;
            this.log(`[/chat] Sending chat to ${room}: ${msg}`, 'secondary');
            this.chatClient?.emit('send_chat', { room, msg });
        });

        btnClearLog.addEventListener('click', () => {
            if (this.logElement) this.logElement.innerHTML = '';
        });
    }

    private log(message: string, type: string = 'secondary') {
        if (!this.logElement) return;
        const time = new Date().toLocaleTimeString();
        const div = document.createElement('div');
        div.className = `text-${type} mb-1`;
        div.innerHTML = `<span class="text-muted">[${time}]</span> ${message}`;
        this.logElement.appendChild(div);
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }

    private resetUI() {
        (this.querySelector('#btn-connect') as HTMLButtonElement).disabled = false;
        (this.querySelector('#btn-disconnect') as HTMLButtonElement).disabled = true;
        (this.querySelector('#btn-send-msg') as HTMLButtonElement).disabled = true;
        (this.querySelector('#btn-broadcast-req') as HTMLButtonElement).disabled = true;
        (this.querySelector('#btn-join-room') as HTMLButtonElement).disabled = true;
        (this.querySelector('#btn-send-chat') as HTMLButtonElement).disabled = true;
    }
}
