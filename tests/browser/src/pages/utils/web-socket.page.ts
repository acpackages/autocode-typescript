import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcWsClient } from "@autocode-ts/ac-ws-client";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'web-socket-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'WebSocket Test Client'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <div class="row g-4">
          <div class="col-lg-6">
            <!-- Connection Card -->
            <div class="card shadow-sm border-0 mb-4">
              <div class="card-header bg-primary text-white py-3">
                <h6 class="mb-0"><i class="fa-solid fa-plug me-2"></i> Connection Settings</h6>
              </div>
              <div class="card-body p-4">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Server URL</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="fa-solid fa-link px-1"></i></span>
                    <input type="text" class="form-control" [(acModel)]="wsUrl" placeholder="ws://localhost:3030" />
                  </div>
                </div>
                <div class="d-flex gap-2">
                   <button class="btn btn-success flex-fill fw-bold" [disabled]="connected" (click)="connect()">
                      <i class="fa-solid fa-play me-2"></i> Connect
                   </button>
                   <button class="btn btn-outline-danger flex-fill fw-bold" [disabled]="!connected" (click)="disconnect()">
                      <i class="fa-solid fa-power-off me-2"></i> Stop
                   </button>
                </div>
                <div class="mt-3 text-center">
                   <div class="badge rounded-pill px-3 py-2" 
                        [acStyle]="{backgroundColor: connected ? '#198754' : '#6c757d'}">
                      {{connected ? 'STREAMS ACTIVE' : 'SYSTEM IDLE'}}
                   </div>
                </div>
              </div>
            </div>

            <!-- Operations Card -->
            <div class="card shadow-sm border-0">
               <div class="card-header bg-dark text-white py-3">
                  <h6 class="mb-0"><i class="fa-solid fa-bolt me-2"></i> Operations</h6>
               </div>
               <div class="card-body p-4">
                  <div class="mb-4">
                     <label class="form-label small fw-bold">Emit Event (Namespace: /)</label>
                     <div class="input-group">
                        <input type="text" class="form-control" [(acModel)]="msgContent" placeholder="Message..." [disabled]="!connected" />
                        <button class="btn btn-primary" (click)="emitHello()" [disabled]="!connected">Emit 'hello'</button>
                     </div>
                  </div>

                  <hr>

                  <div class="mb-3">
                     <label class="form-label small fw-bold">Chat (Namespace: /chat)</label>
                     <div class="input-group mb-2">
                         <span class="input-group-text small">Room</span>
                         <input type="text" class="form-control" [(acModel)]="chatRoom" [disabled]="!connected" />
                         <button class="btn btn-warning btn-sm" (click)="joinRoom()" [disabled]="!connected">Join</button>
                     </div>
                     <div class="input-group">
                        <input type="text" class="form-control" [(acModel)]="chatMsg" placeholder="Chat message..." [disabled]="!joined" />
                        <button class="btn btn-info" (click)="sendChat()" [disabled]="!joined">Send</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Logs Column -->
          <div class="col-lg-6">
             <div class="card shadow-sm border-0 h-100 flex-fill">
                <div class="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                   <h6 class="mb-0 fw-bold">Event Stream</h6>
                   <button class="btn btn-sm btn-link text-decoration-none" (click)="logs = []">Clear Log</button>
                </div>
                <div class="card-body p-0 d-flex flex-column h-100">
                   <div class="flex-fill bg-dark text-light p-3 font-monospace overflow-auto" style="height: 500px;" #logContainer>
                      <div *for="let log of logs" class="mb-2 border-bottom border-secondary pb-1 opacity-75">
                         <span class="text-muted">[{{log.time}}]</span>
                         <span [acStyle]="{color: log.color}" class="ms-2 fw-bold">[{{log.ns}}]</span>
                         <span class="ms-2">{{log.text}}</span>
                      </div>
                      <div *if="logs.length === 0" class="text-secondary text-center py-5 italic">System waiting for packets...</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WebSocketPage {
  @AcViewChild('#logContainer') logContainer!: HTMLElement;

  wsUrl = 'ws://localhost:3030';
  msgContent = '';
  chatRoom = 'lobby';
  chatMsg = '';
  
  connected = false;
  joined = false;
  logs: any[] = [];

  client: AcWsClient | null = null;
  chatClient: AcWsClient | null = null;

  dropdownItems: IAppMenuItem[] = [{ label: 'WS Config', isHeader: true }];

  async connect() {
    this.addLog('SYS', `Initializing streams to ${this.wsUrl}...`, '#0dcaf0');
    
    this.client = new AcWsClient(this.wsUrl);
    this.chatClient = new AcWsClient(this.wsUrl, '/chat');

    this.client.on('connect', () => {
      this.connected = true;
      this.addLog('/', 'Stream connected', '#198754');
    });

    this.client.on('disconnect', () => {
      this.connected = false;
      this.addLog('/', 'Stream closed', '#dc3545');
    });

    this.chatClient.on('connect', () => {
      this.addLog('/chat', 'Namespace connected', '#ffc107');
    });

    this.chatClient.on('joined', (room) => {
      this.joined = true;
      this.addLog('/chat', `Joined room: ${room}`, '#0dcaf0');
    });

    this.chatClient.on('chat_msg', (data: any) => {
       this.addLog('/chat', `[${data.from}]: ${data.msg}`, '#fff');
    });

    await this.client.connect();
    await this.chatClient.connect();
  }

  disconnect() {
    this.client?.disconnect();
    this.chatClient?.disconnect();
  }

  async emitHello() {
    this.addLog('/', `Emitters firing 'hello' with payload: ${this.msgContent}`, '#adb5bd');
    const ack = await this.client?.emit('hello', this.msgContent);
    this.addLog('/', `Ack received: ${JSON.stringify(ack)}`, '#198754');
  }

  joinRoom() {
    this.chatClient?.emit('join', this.chatRoom);
  }

  sendChat() {
     this.chatClient?.emit('send_chat', { room: this.chatRoom, msg: this.chatMsg });
  }

  private addLog(ns: string, text: string, color: string) {
    this.logs.push({
      time: new Date().toLocaleTimeString(),
      ns,
      text,
      color
    });
    setTimeout(() => {
       if (this.logContainer) this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }, 0);
  }
}
