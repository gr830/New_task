import { Component, ElementRef, OnInit, ViewChild, inject, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { NetworkDashboard, NetworkDevice, NetworkLink, NetworkDeviceType, DashboardImage } from '../../core/models';
import cytoscape, { Core } from 'cytoscape';

@Component({
  selector: 'app-network-topology',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-page">
      <div class="top-bar">
        <div class="selector-group">
          <label>🌐 Сегмент сети (Дашборд):</label>
          <select [(ngModel)]="activeDashId" (change)="onDashChange()" style="min-width: 250px;">
            @for (d of dashboards; track d.id) {
              <option [value]="d.id">🗺️ {{ d.name }}</option>
            }
          </select>
          <button class="btn icon-btn" (click)="createNewDash()" title="Создать новый план">+</button>
          @if (activeDashId) {
            <button class="btn icon-btn danger-text" (click)="deleteCurrentDash()" title="Удалить текущий дашборд">🗑️</button>
          }
        </div>

        <div class="actions-group">
          <div class="timer-controls">
            <label>⏱️ Опрос:</label>
            <select [(ngModel)]="selectedIntervalType" (change)="onIntervalChange()">
              <option value="1s">1 сек</option>
              <option value="5s">5 сек (по умолч.)</option>
              <option value="1m">1 мин</option>
              <option value="5m">5 мин</option>
              <option value="10m">10 мин</option>
              <option value="custom">Свой интервал</option>
            </select>
            @if (selectedIntervalType === 'custom') {
              <div class="custom-sec-wrap">
                <input type="number" min="1" [(ngModel)]="customIntervalSec" (change)="onIntervalChange()" style="width: 50px;" />
                <span>сек</span>
              </div>
            }
            <button class="btn icon-btn refresh-btn" [class.spinning]="isRefreshing" (click)="manualRefresh()" title="Обновить статусы прямо сейчас">🔄</button>
          </div>

          <div class="divider"></div>

          <label class="btn outline file-upload">
            🖼️ Добавить картинку/план
            <input type="file" accept="image/*" (change)="onImageUpload($event)" hidden />
          </label>

          <div class="divider"></div>

          <button class="btn green" (click)="openDeviceModal()">+ Добавить устройство</button>
          <button class="btn purple" (click)="openLinkModal()">🔗 Соединить</button>
          <button class="btn outline" (click)="resetLayout()" title="Авто-расстановка незакрепленных узлов">🔄</button>
        </div>
      </div>

      <!-- МОДАЛКИ -->
      @if (showDeviceModal) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3>{{ editingDevice ? '✏️ Редактирование устройства' : '🖥️ Добавление оборудования' }}</h3>
            <div class="form-group">
              <label>Тип оборудования:</label>
              <select [(ngModel)]="newDevice.type">
                @for (t of deviceTypes; track t) { <option [value]="t">{{ getIconForType(t) }} {{ t }}</option> }
              </select>
            </div>
            <div class="form-group"><label>Сетевое имя / Hostname:</label><input [(ngModel)]="newDevice.name" placeholder="Core-SW-01..." /></div>
            <div class="form-group"><label>IP / MAC Адрес:</label><input [(ngModel)]="newDevice.ip" placeholder="10.0.0.1" /></div>
            <div class="form-group">
              <label>Способ мониторинга:</label>
              <div class="radio-group">
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="ICMP_PING"> ICMP Ping</label>
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="SNMP"> SNMP v2/v3</label>
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="TCP_PORT"> TCP Port Scan</label>
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="HTTP_API"> HTTP API</label>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn gray" (click)="showDeviceModal = false">Отмена</button>
              <button class="btn blue" (click)="onSaveDevice()">Сохранить</button>
            </div>
          </div>
        </div>
      }

      @if (showLinkModal) {
        <div class="modal-backdrop">
          <div class="modal wide-modal">
            <h3>🔗 Прокладка связей</h3>
            <div class="bulk-grid">
              <div class="source-column">
                <label>ОТКУДА (Uplink):</label>
                <select [(ngModel)]="fromDevId">
                  <option value="" disabled>Выберите устройство...</option>
                  @for (d of dashDevices; track d.id) { <option [value]="d.id">{{ d.name }} ({{ d.ip }})</option> }
                </select>
                <label style="margin-top:10px;">Тип кабеля / Протокол:</label><input [(ngModel)]="linkType" placeholder="Trunk, Access, SFP 10G..." />
                <label style="margin-top:10px;">Описание связи:</label><textarea [(ngModel)]="linkDescription" rows="2"></textarea>
              </div>
              <div class="target-column">
                <label>КУДА (Downlinks - отметьте галочками):</label>
                <div class="target-checklist">
                  @for (d of dashDevices; track d.id) {
                    <label class="check-item" [class.selected]="selectedTargetIds.has(d.id)">
                      <input type="checkbox" [checked]="selectedTargetIds.has(d.id)" (change)="toggleTarget(d.id)" [disabled]="d.id === fromDevId" />
                      {{ getIconForType(d.type) }} {{ d.name }} ({{ d.ip }})
                    </label>
                  }
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn gray" (click)="showLinkModal = false">Отмена</button>
              <button class="btn blue" (click)="onSaveLinks()" [disabled]="!fromDevId || selectedTargetIds.size === 0">Соединить</button>
            </div>
          </div>
        </div>
      }

      <div class="graph-layout">
        <div class="canvas-box">
          <div class="legend">
            <span class="pulse-dot green"></span> В сети 
            <span class="pulse-dot yellow"></span> Нет IP 
            <span class="pulse-dot red"></span> Ошибка 
            <span class="hint" style="margin-left:auto;">
              ⏱️ Опрос: <b>{{ selectedIntervalType === 'custom' ? customIntervalSec + ' сек.' : selectedIntervalType }}</b> | Правый клик — скрыть связи
            </span>
          </div>
          <div class="cy-container" #cy></div>
        </div>

        <!-- КАРТОЧКА ОБОРУДОВАНИЯ -->
        @if (selectedType === 'node' && selectedDevice) {
          <aside class="side-panel">
            <div class="panel-head">
              <h4>{{ getIconForType(selectedDevice.type) }} {{ selectedDevice.name }}</h4>
              <button (click)="closeSidePanel()">✕</button>
            </div>
            <div class="status-banner" [ngClass]="selectedDevice.status">
              {{ selectedDevice.status === 'online' ? '🟢 ONLINE' : selectedDevice.status === 'warning' ? '🟡 НЕТ IP' : '🔴 OFFLINE' }}
            </div>
            <div class="meta-row"><label>Тип:</label> <b>{{ selectedDevice.type }}</b></div>
            <div class="meta-row"><label>IP Адрес:</label> <code>{{ selectedDevice.ip }}</code></div>
            <div class="meta-row"><label>Опрос:</label> <b>{{ selectedDevice.pollingMethod }}</b></div>
            
            <!-- ПРИВЯЗКА К ПЛАНУ (КАРТИНКЕ) -->
            <div class="meta-row" style="margin-top: 15px; padding: 10px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
              <label style="color: #1e40af; font-weight: bold; margin-bottom: 5px;">📎 Привязать к плану (картинке):</label>
              <select [(ngModel)]="selectedDevice.attachedImageId" (change)="onDeviceAttachmentChange()" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #93c5fd; background: #fff;">
                <option value="">❌ Без привязки</option>
                @for (img of currentDashImages; track img.id; let idx = $index) {
                  <option [value]="img.id">🖼️ {{ img.name || 'План #' + (idx + 1) }}</option>
                }
              </select>
              <small style="color: #64748b; font-size: 11px; display:block; margin-top: 4px;">
                При перемещении этого плана оборудование будет двигаться вместе с ним!
              </small>
            </div>

            <!-- БЛОКИРОВКА ОТ СЛУЧАЙНОГО СДВИГА -->
            <div class="meta-row" style="margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 6px;">
              <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" [checked]="selectedDevice.locked" (change)="toggleDeviceLock()">
                <b>🔒 Закрепить на месте</b>
              </label>
              <small style="color:#94a3b8; font-size:10px;">Запрещает ручной сдвиг оборудования.</small>
            </div>

            <div class="panel-actions" style="margin-top: 15px;">
              <button class="btn blue full-width" (click)="openEditDevice(selectedDevice)" style="margin-bottom: 8px;">✏️ Редактировать</button>
              <button class="btn outline danger full-width" (click)="onDeleteDevice(selectedDevice.id)">🗑️ Удалить</button>
            </div>
          </aside>
        }

        <!-- КАРТОЧКА ИЗОБРАЖЕНИЯ (ПЛАНА) -->
        @if (selectedType === 'image' && selectedImage) {
          <aside class="side-panel">
            <div class="panel-head">
              <h4>🖼️ {{ selectedImage.name || 'Фоновый план' }}</h4>
              <button (click)="closeSidePanel()">✕</button>
            </div>
            
            <div class="form-group" style="margin-top: 10px;">
              <label>Название плана:</label>
              <input [(ngModel)]="selectedImage.name" (change)="saveImagesToDb()" placeholder="Например: Кабинет 101" />
            </div>

            <div class="form-group">
              <label>Масштаб плана (размер):</label>
              <input type="range" min="0.2" max="3" step="0.05" [(ngModel)]="selectedImage.scale" (input)="onImageScaleChange()" />
            </div>

            <div class="meta-row" style="padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
              <span style="font-size: 12px; color: #166534; font-weight: bold;">
                📌 Закреплено оборудования: {{ getAttachedDevicesCount(selectedImage.id) }} шт.
              </span>
              <small style="color: #64748b; font-size: 11px; display:block; margin-top: 3px;">
                Потяните этот план мышкой, и всё закрепленное за ним оборудование сместится вместе с ним.
              </small>
            </div>

            <div class="meta-row" style="margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 6px;">
              <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" [checked]="selectedImage.locked" (change)="toggleImageLock()">
                <b>🔒 Зафиксировать план</b>
              </label>
              <small style="color:#94a3b8; font-size:10px;">Защищает план от случайного перемещения.</small>
            </div>

            <div class="panel-actions" style="margin-top: 15px;">
              <button class="btn outline danger full-width" (click)="onDeleteImage()">🗑️ Удалить план</button>
            </div>
          </aside>
        }

        <!-- КАРТОЧКА СВЯЗИ -->
        @if (selectedType === 'edge' && selectedEdgeData) {
          <aside class="side-panel">
            <div class="panel-head"><h4>🔗 Свойства линка</h4><button (click)="closeSidePanel()">✕</button></div>
            <div class="form-group" style="margin-top: 14px;"><label>Тип соединения / Порт:</label><input [(ngModel)]="editLinkType" /></div>
            <div class="form-group"><label>Описание:</label><textarea [(ngModel)]="editLinkDesc" rows="3"></textarea></div>
            <div class="panel-actions" style="margin-top: 20px;">
              <button class="btn blue full-width" (click)="onUpdateLink()" style="margin-bottom: 8px;">💾 Сохранить изменения</button>
              <button class="btn outline danger full-width" (click)="onDeleteLink(selectedEdgeData.id)">🗑️ Удалить линк</button>
            </div>
          </aside>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow: hidden; }
    .dash-page { padding: 16px 20px; height: calc(100vh - 64px); display: flex; flex-direction: column; box-sizing: border-box; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; background: white; padding: 10px 18px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; flex-shrink:0; }
    .selector-group { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 13px; }
    .selector-group select { padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: bold; }
    .actions-group { display: flex; gap: 8px; align-items: center; }
    .divider { width: 1px; height: 30px; background: #cbd5e1; margin: 0 5px; }
    
    .btn { padding: 8px 14px; border-radius: 6px; font-weight: bold; font-size: 13px; border: none; cursor: pointer; transition: 0.2s; white-space: nowrap; }
    .btn.icon-btn { padding: 8px 12px; font-size: 16px; background: #e2e8f0; }
    .danger-text { color: #ef4444; }
    .btn.purple { background: #7c3aed; color: white; }
    .btn.green { background: #10b981; color: white; }
    .btn.blue { background: #2563eb; color: white; }
    .btn.gray { background: #e2e8f0; color: #475569; }
    .btn.outline { background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; }
    .btn.outline.danger { color: #ef4444; border-color: #fca5a5; }
    .file-upload { cursor: pointer; display: inline-flex; align-items: center; margin: 0; }

    .graph-layout { flex: 1; display: flex; gap: 14px; min-height: 0; }
    .canvas-box { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; position: relative; overflow: hidden; }
    .legend { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(255,255,255,0.9); z-index: 10; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .cy-container { flex: 1; position: absolute; inset: 0; top: 35px; z-index: 2; }
    
    .pulse-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 rgba(0,0,0, 0.4); animation: pulse 2s infinite; }
    .pulse-dot.green { background: #10b981; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); }
    .pulse-dot.yellow { background: #f59e0b; box-shadow: 0 0 0 rgba(245, 158, 11, 0.4); }
    .pulse-dot.red { background: #ef4444; box-shadow: 0 0 0 rgba(239, 68, 68, 0.4); animation: pulse-fast 1s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
    @keyframes pulse-fast { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

    .side-panel { width: 320px; flex-shrink: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; overflow-y: auto; box-shadow: -2px 0 10px rgba(0,0,0,0.04); z-index: 5; }
    .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 16px; font-weight: bold; }
    .panel-head button { background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8; }
    .status-banner { padding: 10px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 16px; color: white; }
    .status-banner.online { background: #10b981; }
    .status-banner.warning { background: #f59e0b; }
    .status-banner.offline { background: #ef4444; }
    .meta-row { margin-bottom: 8px; font-size: 13px; }
    .meta-row label { color: #64748b; display: block; font-size: 11px; margin-bottom: 2px; }
    .meta-row code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
    .full-width { width: 100%; padding: 10px; box-sizing: border-box; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; padding: 24px; border-radius: 12px; width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .wide-modal { width: 700px; max-width: 95vw; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #475569; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-family: inherit; }
    .radio-group { display: flex; flex-direction: column; gap: 6px; font-size: 13px; margin-bottom: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    
    .bulk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 14px; }
    .target-checklist { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
    .check-item { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px; border-radius: 4px; cursor: pointer; }
    .check-item:hover { background: #f8fafc; }
    .check-item.selected { background: #eff6ff; }

    .timer-controls { display: flex; align-items: center; gap: 6px; background: #f8fafc; padding: 3px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px; }
    .timer-controls select { padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: white; cursor: pointer; }
    .custom-sec-wrap { display: flex; align-items: center; gap: 3px; font-size: 11px; color: #475569; }
    .custom-sec-wrap input { padding: 3px 5px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; }
    .refresh-btn { padding: 4px 8px; font-size: 13px; cursor: pointer; }
    .refresh-btn.spinning { animation: spin 0.6s linear infinite; }
  `]
})
export class NetworkTopologyComponent implements OnInit, OnDestroy {
  @ViewChild('cy', { static: false }) cyEl!: ElementRef;

  private api = inject(ApiService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  cyInstance: Core | null = null;
  pollingTimer: any;
  
  refreshInterval = 5000;
  selectedIntervalType = '5s';
  customIntervalSec = 30;
  isRefreshing = false;

  dashboards: NetworkDashboard[] = [];
  devices: NetworkDevice[] = [];
  links: NetworkLink[] = [];

  activeDashId = '';
  dashDevices: NetworkDevice[] = [];
  dashLinks: NetworkLink[] = [];

  showDeviceModal = false;
  editingDevice = false;
  deviceTypes: NetworkDeviceType[] = ['Микротик', 'Свитч', 'Сервер', 'Вайфай', 'Принтер', 'Компьютер', 'Тонкий клиент', 'Ноутбук', 'Телефон', 'Станок ЧПУ', 'Камера', 'Другой'];
  newDevice: Partial<NetworkDevice> = { type: 'Свитч', pollingMethod: 'ICMP_PING' };

  showLinkModal = false;
  fromDevId = '';
  selectedTargetIds = new Set<string>();
  linkType = '';
  linkDescription = '';

  selectedType: 'node' | 'edge' | 'image' | null = null;
  selectedDevice: NetworkDevice | null = null;
  selectedImage: DashboardImage | null = null;
  selectedEdgeData: any = null;
  editLinkType = '';
  editLinkDesc = '';

  ngOnInit() { this.loadData(); }

  ngOnDestroy() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    if (this.cyInstance) this.cyInstance.destroy();
  }

  get currentDashImages(): DashboardImage[] {
    const dash = this.dashboards.find(d => d.id === this.activeDashId);
    return dash?.images || [];
  }

  loadData() {
    this.api.getNetworkDashboards().subscribe(dashes => {
      this.dashboards = dashes;
      if (this.dashboards.length > 0 && (!this.activeDashId || !this.dashboards.some(d => d.id === this.activeDashId))) {
        this.activeDashId = this.dashboards[0].id;
      }
      this.api.getNetworkDevices().subscribe(devs => {
        this.devices = devs;
        this.api.getNetworkLinks().subscribe(lnks => {
          this.links = lnks;
          this.onDashChange();
        });
      });
    });

    this.api.getNetworkSettings().subscribe({
      next: cfg => {
        if (cfg) {
          this.refreshInterval = cfg.pollIntervalMs || 5000;
          this.selectedIntervalType = cfg.intervalType || '5s';
          this.customIntervalSec = cfg.customSec || 30;
          this.restartPollingTimer();
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  getIconForType(type: NetworkDeviceType | string): string {
    const icons: Record<string, string> = {
      'Микротик': '🎛️', 'Свитч': '🔄', 'Сервер': '🗄️', 'Вайфай': '📡', 'Принтер': '🖨️',
      'Компьютер': '🖥️', 'Тонкий клиент': '💻', 'Ноутбук': '💻', 'Телефон': '☎️',
      'Станок ЧПУ': '⚙️', 'Камера': '📹', 'Другой': '📦'
    };
    return icons[type] || '📦';
  }

  getIconSvg(type: NetworkDeviceType | string): string {
    const icon = this.getIconForType(type);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46"><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-size="24">${icon}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  onDashChange() {
    this.closeSidePanel();
    this.dashDevices = this.devices.filter(d => d.dashboardId === this.activeDashId);
    const devIds = new Set(this.dashDevices.map(d => d.id));
    this.dashLinks = this.links.filter(l => devIds.has(l.sourceId) && devIds.has(l.targetId));
    
    this.cdr.detectChanges();
    setTimeout(() => this.renderGraph(), 50);
  }

  createNewDash() {
    const name = prompt('Введите название нового сегмента сети:');
    if (name) {
      this.api.addNetworkDashboard({ name }).subscribe(res => {
        this.dashboards.push(res);
        this.activeDashId = res.id;
        this.onDashChange();
      });
    }
  }

  deleteCurrentDash() {
    if (!this.activeDashId) return;
    if (confirm('Удалить дашборд? Устройства останутся в базе.')) {
      this.api.deleteNetworkDashboard(this.activeDashId).subscribe(() => {
        this.dashboards = this.dashboards.filter(d => d.id !== this.activeDashId);
        this.activeDashId = this.dashboards.length > 0 ? this.dashboards[0].id : '';
        this.onDashChange();
      });
    }
  }

  // ЗАГРУЗКА МНОЖЕСТВА КАРТИНОК
  onImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file || !this.activeDashId) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1400; // Оптимальный размер
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.55);

        const dash = this.dashboards.find(d => d.id === this.activeDashId);
        if (dash) {
          if (!dash.images) dash.images = [];
          
          // Сдвигаем новую картинку в сторону от существующих, чтобы они не накладывались
          const count = dash.images.length;
          const newX = count > 0 ? (dash.images[count - 1].x + 350) : 0;
          const newY = count > 0 ? (dash.images[count - 1].y + 50) : 0;

          dash.images.push({
            id: 'img_' + Date.now(),
            name: `План ${count + 1}`,
            url: compressedBase64,
            x: newX,
            y: newY,
            width: width,
            height: height,
            scale: 1,
            locked: false
          });

          this.api.updateNetworkDashboard(dash.id, { images: dash.images }).subscribe({
            next: () => {
              this.renderGraph();
            },
            error: () => alert('Ошибка при сохранении: файл слишком большой для базы.')
          });
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // СБРОС ИНПУТА ДЛЯ ВОЗМОЖНОСТИ ПОВТОРНОЙ ЗАГРУЗКИ
  }

  saveImagesToDb() {
    const dash = this.dashboards.find(d => d.id === this.activeDashId);
    if (dash && dash.images) {
      this.api.updateNetworkDashboard(dash.id, { images: dash.images }).subscribe();
    }
  }

  updateNodePositionInDb(node: any) {
    const id = node.id();
    const pos = node.position();
    
    if (node.data('isImage')) {
      const dash = this.dashboards.find(d => d.id === this.activeDashId);
      if (dash && dash.images) {
        const img = dash.images.find(i => i.id === id);
        if (img) {
          img.x = pos.x; img.y = pos.y;
          this.saveImagesToDb();
        }
      }
    } else {
      const dev = this.dashDevices.find(d => d.id === id);
      if (dev) {
        dev.x = pos.x; dev.y = pos.y;
        this.api.updateNetworkDevice(id, { x: pos.x, y: pos.y }).subscribe();
      }
    }
  }

  // ПРИВЯЗКА УСТРОЙСТВА К КАРТИНКЕ
  onDeviceAttachmentChange() {
    if (!this.selectedDevice) return;
    this.api.updateNetworkDevice(this.selectedDevice.id, {
      attachedImageId: this.selectedDevice.attachedImageId || ''
    }).subscribe();
  }

  getAttachedDevicesCount(imageId: string): number {
    return this.dashDevices.filter(d => d.attachedImageId === imageId).length;
  }

  toggleDeviceLock() {
    if (!this.selectedDevice) return;
    this.selectedDevice.locked = !this.selectedDevice.locked;
    const node = this.cyInstance?.getElementById(this.selectedDevice.id);
    if (node) this.selectedDevice.locked ? node.lock() : node.unlock();
    this.api.updateNetworkDevice(this.selectedDevice.id, { locked: this.selectedDevice.locked }).subscribe();
  }

  toggleImageLock() {
    if (!this.selectedImage) return;
    this.selectedImage.locked = !this.selectedImage.locked;
    const node = this.cyInstance?.getElementById(this.selectedImage.id);
    if (node) this.selectedImage.locked ? node.lock() : node.unlock();
    this.saveImagesToDb();
  }

  onImageScaleChange() {
    if (!this.selectedImage || !this.cyInstance) return;
    const node = this.cyInstance.getElementById(this.selectedImage.id);
    if (node) {
      node.data('width', (this.selectedImage.width * this.selectedImage.scale) + 'px');
      node.data('height', (this.selectedImage.height * this.selectedImage.scale) + 'px');
    }
    this.saveImagesToDb();
  }

  onDeleteImage() {
    if (!this.selectedImage || !confirm('Удалить этот план?')) return;
    const dash = this.dashboards.find(d => d.id === this.activeDashId);
    if (dash && dash.images) {
      dash.images = dash.images.filter(i => i.id !== this.selectedImage!.id);
      
      // Открепляем устройства от удаленного плана
      this.dashDevices.filter(d => d.attachedImageId === this.selectedImage!.id).forEach(d => {
        d.attachedImageId = '';
        this.api.updateNetworkDevice(d.id, { attachedImageId: '' }).subscribe();
      });

      this.api.updateNetworkDashboard(dash.id, { images: dash.images }).subscribe(() => {
        this.closeSidePanel();
        this.renderGraph();
      });
    }
  }

  resetLayout() {
    if (this.cyInstance) {
      this.cyInstance.layout({ name: 'cose', padding: 50 }).run();
      this.cyInstance.nodes().forEach(node => {
        if (!node.locked()) this.updateNodePositionInDb(node);
      });
    }
  }

  openDeviceModal() { this.editingDevice = false; this.newDevice = { type: 'Свитч', pollingMethod: 'ICMP_PING' }; this.showDeviceModal = true; }
  openEditDevice(dev: NetworkDevice) { this.editingDevice = true; this.newDevice = { ...dev }; this.showDeviceModal = true; }
  onSaveDevice() {
    if (!this.newDevice.name) return;
    if (this.editingDevice && this.newDevice.id) {
      this.api.updateNetworkDevice(this.newDevice.id, this.newDevice).subscribe(() => { this.showDeviceModal = false; this.loadData(); });
    } else {
      this.newDevice.dashboardId = this.activeDashId;
      this.api.addNetworkDevice(this.newDevice).subscribe(() => { this.showDeviceModal = false; this.loadData(); });
    }
  }
  onDeleteDevice(id: string) { if (confirm('Удалить устройство?')) { this.api.deleteNetworkDevice(id).subscribe(() => { this.closeSidePanel(); this.loadData(); }); } }

  openLinkModal() { this.fromDevId = ''; this.selectedTargetIds.clear(); this.linkType = ''; this.linkDescription = ''; this.showLinkModal = true; }
  toggleTarget(id: string) { this.selectedTargetIds.has(id) ? this.selectedTargetIds.delete(id) : this.selectedTargetIds.add(id); }
  onSaveLinks() {
    if (!this.fromDevId || this.selectedTargetIds.size === 0) return;
    const toCreate = Array.from(this.selectedTargetIds).map(toId => ({ sourceId: this.fromDevId, targetId: toId, type: this.linkType, description: this.linkDescription }));
    this.api.addNetworkLinks(toCreate).subscribe(() => { this.showLinkModal = false; this.loadData(); });
  }
  onUpdateLink() {
    if (!this.selectedEdgeData) return;
    this.api.updateNetworkLink(this.selectedEdgeData.id, { type: this.editLinkType, description: this.editLinkDesc }).subscribe(() => { this.closeSidePanel(); this.loadData(); });
  }
  onDeleteLink(id: string) {
    if (confirm('Удалить эту связь?')) { this.api.deleteNetworkLink(id).subscribe(() => { this.closeSidePanel(); this.loadData(); }); }
  }

  fetchRealStatuses() {
    if (!this.cyInstance || this.dashDevices.length === 0) return;
    this.api.getNetworkDevices().subscribe(updatedDevices => {
      let changed = false;
      updatedDevices.forEach(freshDev => {
        const localDev = this.dashDevices.find(d => d.id === freshDev.id);
        if (localDev && localDev.status !== freshDev.status) {
          localDev.status = freshDev.status;
          changed = true;
        }
      });
      if (changed) {
        this.zone.run(() => {
          this.dashDevices.forEach(d => this.cyInstance?.getElementById(d.id).data('status', d.status));
          if (this.selectedDevice) {
            const updated = this.dashDevices.find(d => d.id === this.selectedDevice!.id);
            if (updated) this.selectedDevice.status = updated.status;
          }
          this.cdr.detectChanges();
        });
      }
    });
  }

  closeSidePanel() {
    this.selectedType = null;
    this.selectedDevice = null;
    this.selectedImage = null;
    this.selectedEdgeData = null;
    if (this.cyInstance) this.cyInstance.elements().unselect();
  }

  renderGraph() {
    if (!this.cyEl) return;
    if (this.cyInstance) { this.cyInstance.destroy(); this.cyInstance = null; }

    const dash = this.dashboards.find(d => d.id === this.activeDashId);
    
    // Формируем Изображения (задний план)
    const imageNodes = (dash?.images || []).map(img => ({
      data: {
        id: img.id,
        isImage: true,
        url: img.url,
        width: (img.width * (img.scale || 1)) + 'px',
        height: (img.height * (img.scale || 1)) + 'px'
      },
      position: { x: img.x || 0, y: img.y || 0 },
      locked: !!img.locked,
      selectable: true,
      grabbable: !img.locked
    }));

    // Формируем Оборудование (передний план)
    const deviceNodes = this.dashDevices.map(d => ({
      data: { id: d.id, name: d.name, iconSvg: this.getIconSvg(d.type), status: d.status, isCollapsed: false },
      position: (d.x !== undefined && d.y !== undefined) ? { x: d.x, y: d.y } : undefined,
      locked: !!d.locked,
      selectable: true,
      grabbable: !d.locked
    }));

    const edges = this.dashLinks.map(l => ({
      data: { id: `link_${l.id}`, rawId: l.id, source: l.sourceId, target: l.targetId, label: l.type, description: l.description }
    }));

    this.cyInstance = cytoscape({
      container: this.cyEl.nativeElement,
      elements: [...imageNodes, ...deviceNodes, ...edges],
      wheelSensitivity: 2.0,
      style: [
        // 1. СТИЛЬ ДЛЯ КАРТИНОК (Z-INDEX 1)
        {
          selector: 'node[isImage]',
          style: {
            'shape': 'rectangle',
            'background-image': 'data(url)',
            'background-fit': 'contain',
            'width': 'data(width)',
            'height': 'data(height)',
            'background-color': 'transparent',
            'border-width': (ele: any) => ele.selected() ? 3 : 0,
            'border-color': '#2563eb',
            'border-style': 'dashed',
            'z-index': 1,
            'z-index-compare': 'manual'
          }
        },
        // 2. СТИЛЬ ДЛЯ СВЯЗЕЙ (Z-INDEX 10 — СТРОГО ПОВЕРХ КАРТИНОК!)
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#2563eb',
            'target-arrow-color': '#2563eb',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-rotation': 'autorotate',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'color': '#1e293b',
            'z-index': 10,
            'z-index-compare': 'manual'
          }
        },
        // 3. СТИЛЬ ДЛЯ ОБОРУДОВАНИЯ (Z-INDEX 20 — ПОВЕРХ СВЯЗЕЙ И КАРТИНОК)
        {
          selector: 'node[!isImage]',
          style: {
            'shape': 'round-rectangle',
            'label': 'data(name)',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'color': '#1e293b',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-background-color': 'rgba(255,255,255,0.85)',
            'text-background-opacity': 1,
            'background-color': '#ffffff',
            'background-image': 'data(iconSvg)',
            'background-fit': 'none',
            'background-width': '26px',
            'background-height': '26px',
            'border-width': 4,
            'border-color': (ele: any) => {
              const status = ele.data('status');
              return status === 'online' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
            },
            'width': '46px',
            'height': '46px',
            'z-index': 20,
            'z-index-compare': 'manual'
          }
        },
        { selector: 'node.collapsed', style: { 'border-style': 'dashed', 'border-color': '#8b5cf6' } },
        { selector: '.hidden', style: { 'display': 'none' } }
      ],
      layout: { name: 'preset' }
    });

    // --- ЛОГИКА СИНХРОННОГО ПЕРЕМЕЩЕНИЯ (ПРИВЯЗКА ОБОРУДОВАНИЯ К КАРТИНКЕ) ---
    let dragStartPos = { x: 0, y: 0 };
    let attachedNodesInitPos = new Map<string, { x: number, y: number }>();

    // 1. При захвате картинки запоминаем начальные точки привязанного оборудования
    this.cyInstance.on('grab', 'node[isImage]', evt => {
      const imgNode = evt.target;
      dragStartPos = { ...imgNode.position() };
      attachedNodesInitPos.clear();
      
      const imgId = imgNode.id();
      this.dashDevices.filter(d => d.attachedImageId === imgId).forEach(d => {
        const devNode = this.cyInstance?.getElementById(d.id);
        if (devNode && devNode.length > 0) {
          attachedNodesInitPos.set(d.id, { ...devNode.position() });
        }
      });
    });

    // 2. В процессе таскания смещаем всё привязанное оборудование синхронно
    this.cyInstance.on('drag', 'node[isImage]', evt => {
      const imgNode = evt.target;
      const curPos = imgNode.position();
      const dx = curPos.x - dragStartPos.x;
      const dy = curPos.y - dragStartPos.y;

      attachedNodesInitPos.forEach((initPos, devId) => {
        const devNode = this.cyInstance?.getElementById(devId);
        if (devNode && devNode.length > 0) {
          devNode.position({
            x: initPos.x + dx,
            y: initPos.y + dy
          });
        }
      });
    });

    // 3. При отпускании сохраняем координаты картинки и всех её устройств в БД
    this.cyInstance.on('dragfree', 'node[isImage]', evt => {
      const imgNode = evt.target;
      this.updateNodePositionInDb(imgNode);

      attachedNodesInitPos.forEach((_, devId) => {
        const devNode = this.cyInstance?.getElementById(devId);
        if (devNode && devNode.length > 0) {
          const p = devNode.position();
          const dev = this.dashDevices.find(d => d.id === devId);
          if (dev) {
            dev.x = p.x;
            dev.y = p.y;
            this.api.updateNetworkDevice(devId, { x: p.x, y: p.y }).subscribe();
          }
        }
      });
    });

    // Отдельное перемещение конкретного оборудования
    this.cyInstance.on('dragfree', 'node[!isImage]', evt => this.updateNodePositionInDb(evt.target));

    // ПРАВЫЙ КЛИК ПО ОБОРУДОВАНИЮ: СВЕРНУТЬ / РАЗВЕРНУТЬ ВСЮ ЦЕПОЧКУ (ВЕТКУ)
    this.cyInstance.on('cxttap', 'node[!isImage]', evt => {
      const node = evt.target;
      const isCollapsed = node.hasClass('collapsed');

      if (isCollapsed) {
        // РАЗВОРАЧИВАЕМ: восстанавливаем всю нисходящую ветку
        node.removeClass('collapsed');
        const visited = new Set<string>();

        const revealBranch = (curr: any) => {
          if (visited.has(curr.id())) return;
          visited.add(curr.id());

          const outEdges = curr.outgoers('edge');
          const outNodes = curr.outgoers('node[!isImage]');

          outEdges.removeClass('hidden');
          outNodes.removeClass('hidden');

          outNodes.forEach((child: any) => {
            // Если дочернее устройство само НЕ свернуто — продолжаем раскрывать цепочку дальше
            if (!child.hasClass('collapsed')) {
              revealBranch(child);
            }
          });
        };

        revealBranch(node);
      } else {
        // СВОРАЧИВАЕМ: скрываем ВСЮ цепочку на любую глубину (ПК, принтеры, свитчи и т.д.)
        node.addClass('collapsed');
        node.successors('node[!isImage], edge').addClass('hidden');
      }
    });

    this.cyInstance.on('tap', 'node', evt => {
      const node = evt.target;
      const id = node.id();
      this.zone.run(() => {
        if (node.data('isImage')) {
          this.selectedType = 'image';
          const dsh = this.dashboards.find(d => d.id === this.activeDashId);
          this.selectedImage = dsh?.images?.find(i => i.id === id) || null;
        } else {
          this.selectedType = 'node';
          this.selectedDevice = this.dashDevices.find(d => d.id === id) || null;
        }
        this.cdr.detectChanges();
      });
    });

    this.cyInstance.on('tap', 'edge', evt => {
      const d = evt.target.data();
      this.zone.run(() => {
        this.selectedType = 'edge';
        const sourceDev = this.dashDevices.find(dev => dev.id === d.source);
        const targetDev = this.dashDevices.find(dev => dev.id === d.target);
        this.selectedEdgeData = { id: d.rawId, sourceTitle: sourceDev?.name || 'Unknown', targetTitle: targetDev?.name || 'Unknown' };
        this.editLinkType = d.label;
        this.editLinkDesc = d.description || '';
        this.cdr.detectChanges();
      });
    });

    this.cyInstance.on('tap', evt => {
      if (evt.target === this.cyInstance) this.zone.run(() => this.closeSidePanel());
    });
  }

  onIntervalChange() {
    if (this.selectedIntervalType === '1s') this.refreshInterval = 1000;
    else if (this.selectedIntervalType === '5s') this.refreshInterval = 5000;
    else if (this.selectedIntervalType === '1m') this.refreshInterval = 60000;
    else if (this.selectedIntervalType === '5m') this.refreshInterval = 300000;
    else if (this.selectedIntervalType === '10m') this.refreshInterval = 600000;
    else if (this.selectedIntervalType === 'custom') this.refreshInterval = Math.max(1, this.customIntervalSec) * 1000;

    this.api.updateNetworkSettings({
      pollIntervalMs: this.refreshInterval,
      intervalType: this.selectedIntervalType,
      customSec: this.customIntervalSec,
      forcePoll: Date.now()
    }).subscribe(() => setTimeout(() => this.fetchRealStatuses(), 1500));
    this.restartPollingTimer();
  }

  restartPollingTimer() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(() => this.fetchRealStatuses(), this.refreshInterval);
  }

  manualRefresh() {
    this.isRefreshing = true;
    this.cdr.detectChanges();
    this.api.updateNetworkSettings({ forcePoll: Date.now() }).subscribe({
      next: () => setTimeout(() => { this.fetchRealStatuses(); this.isRefreshing = false; this.cdr.detectChanges(); }, 1500),
      error: () => { this.isRefreshing = false; this.cdr.detectChanges(); }
    });
  }
}