import { Component, ElementRef, OnInit, ViewChild, inject, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { NetworkDashboard, NetworkDevice, NetworkLink, NetworkDeviceType } from '../../core/models';
import cytoscape, { Core } from 'cytoscape';

@Component({
  selector: 'app-network-topology',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-page">
      <!-- ВЕРХНЯЯ ПАНЕЛЬ -->
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
          <!-- ВЫБОР ИНТЕРВАЛА И КНОПКА ОБНОВИТЬ ВРУЧНУЮ -->
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

            <button class="btn icon-btn refresh-btn" [class.spinning]="isRefreshing" (click)="manualRefresh()" title="Обновить статусы прямо сейчас">
              🔄
            </button>
          </div>

          <div class="divider"></div>

          <!-- Загрузка с компрессией -->
          <label class="btn outline file-upload">
            🖼️ Загрузить фон (Авто-сжатие)
            <input type="file" accept="image/*" (change)="onBgUpload($event)" hidden />
          </label>
          @if (activeDashBg) {
            <button class="btn outline danger" (click)="clearBg()">✕ Убрать фон</button>
          }

          <div class="divider"></div>

          <button class="btn green" (click)="openDeviceModal()">+ Добавить устройство</button>
          <button class="btn purple" (click)="openLinkModal()">🔗 Соединить</button>
          <button class="btn outline" (click)="resetLayout()" title="Сбросить сохраненные координаты">🔄</button>
        </div>
      </div>

      <!-- МОДАЛКА: СОЗДАНИЕ / РЕДАКТИРОВАНИЕ УСТРОЙСТВА -->
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

            <div class="form-group">
              <label>Сетевое имя / Hostname:</label>
              <input [(ngModel)]="newDevice.name" placeholder="Core-SW-01..." />
            </div>

            <div class="form-group">
              <label>IP / MAC Адрес:</label>
              <input [(ngModel)]="newDevice.ip" placeholder="10.0.0.1" />
            </div>

            <div class="form-group">
              <label>Способ мониторинга (Polling):</label>
              <div class="radio-group">
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="ICMP_PING"> ICMP Ping</label>
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="SNMP"> SNMP v2/v3</label>
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="TCP_PORT"> TCP Port Scan</label>
                <label><input type="radio" [(ngModel)]="newDevice.pollingMethod" value="HTTP_API"> HTTP API</label>
              </div>
              <a href="javascript:void(0)" class="info-link" (click)="showPollingInfo = true">Как это работает? (Подробнее)</a>
            </div>

            <div class="modal-actions">
              <button class="btn gray" (click)="showDeviceModal = false">Отмена</button>
              <button class="btn blue" (click)="onSaveDevice()">Сохранить</button>
            </div>
          </div>
        </div>
      }

      <!-- МОДАЛКА: ИНФО О МОНИТОРИНГЕ -->
      @if (showPollingInfo) {
        <div class="modal-backdrop" style="z-index: 2000;">
          <div class="modal">
            <h3>ℹ️ Реальный мониторинг сети (Enterprise Poller Service)</h3>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Мониторинг выполняется реальным серверным сервисом <b>poller.js</b> в фоновом режиме:<br><br>
              <b>🟢 ICMP Ping:</b> Реальная отправка ICMP echo-пакетов через сетевой стек ОС. Проверяет физическую доступность хоста.<br>
              <b>🔌 TCP Port Scan:</b> Реальная проверка доступности порта через прямое сокет-соединение (например: <code>192.168.250.139:8291</code> для WinBox, <code>:1433</code> для SQL, <code>:80</code> для Web).<br>
              <b>🌐 HTTP API:</b> Выполнение реальных GET-запросов к веб-сервисам с проверкой кодов ответа HTTP 200.<br>
              <b>📡 SNMP:</b> Базовая диагностика сетевых интерфейсов управляемых коммутаторов и маршрутизаторов.<br><br>
              <b>Цветовая индикация:</b><br>
              • 🟢 <b>Зеленый:</b> Оборудование отвечает на запросы и активно в сети.<br>
              • 🟡 <b>Желтый:</b> Оборудование добавлено на план, но IP-адрес не указан (требуется настройка).<br>
              • 🔴 <b>Красный:</b> Оборудование недоступно (таймаут пинга или закрыт порт).
            </p>
            <div class="modal-actions"><button class="btn blue" (click)="showPollingInfo = false">Понятно</button></div>
          </div>
        </div>
      }

      <!-- МОДАЛКА: СОЗДАНИЕ СВЯЗИ -->
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
                
                <label style="margin-top:10px;">Тип кабеля / Протокол:</label>
                <input [(ngModel)]="linkType" placeholder="Trunk, Access, SFP 10G..." />
                
                <label style="margin-top:10px;">Описание связи:</label>
                <textarea [(ngModel)]="linkDescription" rows="2" placeholder="Назначение линка..."></textarea>
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

      <!-- ХОЛСТ ГРАФА И ФОН -->
      <div class="graph-layout">
        <div class="canvas-box">
          <div class="bg-layer" [style.background-image]="activeDashBg ? 'url(' + activeDashBg + ')' : 'none'" #bgLayer></div>
          
          <div class="legend">
            <span class="pulse-dot green"></span> В сети (Online)
            <span class="pulse-dot yellow"></span> Не настроен (Нет IP)
            <span class="pulse-dot red"></span> Ошибка (Offline)
            <span class="hint" style="margin-left:auto;">
              ⏱️ Авто-опрос: <b>{{ selectedIntervalType === 'custom' ? customIntervalSec + ' сек.' : selectedIntervalType }}</b> | 
              <b>Правый клик</b> по узлу — скрыть/раскрыть связи.
            </span>
          </div>

          <div class="cy-container" #cy></div>
        </div>

        <!-- КАРТОЧКА ОБОРУДОВАНИЯ (УЗЕЛ) -->
        @if (selectedType === 'node' && selectedDevice) {
          <aside class="side-panel">
            <div class="panel-head">
              <h4>{{ getIconForType(selectedDevice.type) }} {{ selectedDevice.name }}</h4>
              <button (click)="closeSidePanel()">✕</button>
            </div>
            
            <div class="status-banner" [ngClass]="selectedDevice.status">
              {{ 
                selectedDevice.status === 'online' ? '🟢 ONLINE (Отвечает)' : 
                selectedDevice.status === 'warning' ? '🟡 ВНИМАНИЕ (Не указан IP)' : 
                '🔴 OFFLINE (Нет ответа)' 
              }}
            </div>

            <div class="meta-row"><label>Тип:</label> <b>{{ selectedDevice.type }}</b></div>
            <div class="meta-row"><label>IP Адрес:</label> <code>{{ selectedDevice.ip }}</code></div>
            <div class="meta-row"><label>Метод опроса:</label> <b>{{ selectedDevice.pollingMethod }}</b></div>

            <div class="panel-actions" style="margin-top: 20px;">
              <button class="btn blue full-width" (click)="openEditDevice(selectedDevice)" style="margin-bottom: 8px;">✏️ Редактировать</button>
              <button class="btn outline danger full-width" (click)="onDeleteDevice(selectedDevice.id)">🗑️ Удалить</button>
            </div>
          </aside>
        }

        <!-- КАРТОЧКА СВЯЗИ (ЛИНИЯ) -->
        @if (selectedType === 'edge' && selectedEdgeData) {
          <aside class="side-panel">
            <div class="panel-head">
              <h4>🔗 Свойства линка</h4>
              <button (click)="closeSidePanel()">✕</button>
            </div>

            <div class="form-group" style="margin-top: 14px;">
              <label>Тип соединения / Порт:</label>
              <input [(ngModel)]="editLinkType" />
            </div>

            <div class="form-group">
              <label>Описание:</label>
              <textarea [(ngModel)]="editLinkDesc" rows="3"></textarea>
            </div>

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
    .danger-text:hover { background: #fee2e2; }
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
    
    .bg-layer {
      position: absolute; top: 35px; left: 0; width: 100%; height: 100%; z-index: 1;
      background-repeat: no-repeat; background-position: left top; background-size: contain;
      transform-origin: 0 0; pointer-events: none; opacity: 0.85;
    }

    .pulse-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 rgba(0,0,0, 0.4); animation: pulse 2s infinite; }
    .pulse-dot.green { background: #10b981; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); }
    .pulse-dot.red { background: #ef4444; box-shadow: 0 0 0 rgba(239, 68, 68, 0.4); animation: pulse-fast 1s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
    @keyframes pulse-fast { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

    .side-panel { width: 320px; flex-shrink: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; overflow-y: auto; box-shadow: -2px 0 10px rgba(0,0,0,0.04); z-index: 5; }
    .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 16px; font-weight: bold; }
    .panel-head button { background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8; }
    
    .status-banner { padding: 10px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 16px; color: white; }
    .status-banner.online { background: #10b981; }
    .status-banner.warning { background: #f59e0b; } /* Желтый баннер */
    .status-banner.offline { background: #ef4444; }

    .pulse-dot.yellow { background: #f59e0b; box-shadow: 0 0 0 rgba(245, 158, 11, 0.4); } /* Желтая точка */
    
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
    .info-link { font-size: 11px; color: #2563eb; text-decoration: none; font-weight: 600; }
    .info-link:hover { text-decoration: underline; }
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
  @ViewChild('bgLayer', { static: false }) bgLayer!: ElementRef;

  private api = inject(ApiService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  cyInstance: Core | null = null;
  pollingTimer: any;
  
  // НАСТРОЙКИ ТАЙМЕРА ОБНОВЛЕНИЯ:
  refreshInterval = 5000;
  selectedIntervalType = '5s';
  customIntervalSec = 30;
  isRefreshing = false;

  dashboards: NetworkDashboard[] = [];
  devices: NetworkDevice[] = [];
  links: NetworkLink[] = [];

  activeDashId = '';
  activeDashBg = '';
  dashDevices: NetworkDevice[] = [];
  dashLinks: NetworkLink[] = [];

  // Модалка устройств
  showDeviceModal = false;
  editingDevice = false;
  deviceTypes: NetworkDeviceType[] = ['Микротик', 'Свитч', 'Сервер', 'Вайфай', 'Принтер', 'Компьютер', 'Тонкий клиент', 'Ноутбук', 'Телефон', 'Станок ЧПУ', 'Камера', 'Другой'];
  newDevice: Partial<NetworkDevice> = { type: 'Свитч', pollingMethod: 'ICMP_PING' };
  showPollingInfo = false;

  // Модалка связей (Добавление)
  showLinkModal = false;
  fromDevId = '';
  selectedTargetIds = new Set<string>();
  linkType = '';
  linkDescription = '';

  // Правая панель
  selectedType: 'node' | 'edge' | null = null;
  selectedDevice: NetworkDevice | null = null;
  
  selectedEdgeData: any = null;
  editLinkType = '';
  editLinkDesc = '';

  ngOnInit() {
    this.loadData();
    this.restartPollingTimer();
  }

  ngOnDestroy() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    if (this.cyInstance) this.cyInstance.destroy();
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

  // Генерирует SVG для отображения иконки внутри квадрата:
  getIconSvg(type: NetworkDeviceType | string): string {
    const icon = this.getIconForType(type);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46">
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-size="24">${icon}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  onDashChange() {
    this.closeSidePanel();
    const dash = this.dashboards.find(d => d.id === this.activeDashId);
    this.activeDashBg = dash?.bgImage || '';
    
    this.dashDevices = this.devices.filter(d => d.dashboardId === this.activeDashId);
    const devIds = new Set(this.dashDevices.map(d => d.id));
    this.dashLinks = this.links.filter(l => devIds.has(l.sourceId) && devIds.has(l.targetId));
    
    this.cdr.detectChanges();
    setTimeout(() => this.renderGraph(), 50);
  }

  createNewDash() {
    const name = prompt('Введите название нового сегмента сети (например: Склад 2):');
    if (name) {
      this.api.addNetworkDashboard({ name, bgImage: '' }).subscribe(res => {
        this.dashboards.push(res);
        this.activeDashId = res.id;
        this.onDashChange();
      });
    }
  }

  deleteCurrentDash() {
    if (!this.activeDashId) return;
    if (confirm('Вы уверены, что хотите удалить весь дашборд? Устройства и связи останутся в БД, но исчезнут с плана.')) {
      this.api.deleteNetworkDashboard(this.activeDashId).subscribe(() => {
        this.dashboards = this.dashboards.filter(d => d.id !== this.activeDashId);
        this.activeDashId = this.dashboards.length > 0 ? this.dashboards[0].id : '';
        this.onDashChange();
      });
    }
  }

  // --- КОМПРЕССИЯ ФОНА ЧЕРЕЗ CANVAS ПЕРЕД ОТПРАВКОЙ НА СЕРВЕР ---
  onBgUpload(event: any) {
    const file = event.target.files[0];
    if (!file || !this.activeDashId) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Создаем Canvas для сжатия
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920; // Максимальная ширина фона
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

        // Сжимаем в JPEG качества 50% (сильно режет вес для JSON сервера)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

        this.api.updateNetworkDashboard(this.activeDashId, { bgImage: compressedBase64 }).subscribe({
          next: () => {
            this.activeDashBg = compressedBase64;
            const dash = this.dashboards.find(d => d.id === this.activeDashId);
            if (dash) dash.bgImage = compressedBase64;
            this.cdr.detectChanges();
          },
          error: (err) => alert('Ошибка сервера: Файл всё ещё слишком велик. Попробуйте сжать картинку перед загрузкой.')
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clearBg() {
    this.api.updateNetworkDashboard(this.activeDashId, { bgImage: '' }).subscribe(() => {
      this.activeDashBg = '';
      const dash = this.dashboards.find(d => d.id === this.activeDashId);
      if (dash) dash.bgImage = '';
      this.cdr.detectChanges();
    });
  }

  // --- CRUD УСТРОЙСТВА ---
  openDeviceModal() {
    this.editingDevice = false;
    this.newDevice = { type: 'Свитч', pollingMethod: 'ICMP_PING' };
    this.showDeviceModal = true;
  }

  openEditDevice(dev: NetworkDevice) {
    this.editingDevice = true;
    this.newDevice = { ...dev };
    this.showDeviceModal = true;
  }

  onSaveDevice() {
    if (!this.newDevice.name) return;
    
    if (this.editingDevice && this.newDevice.id) {
      this.api.updateNetworkDevice(this.newDevice.id, this.newDevice).subscribe(() => {
        this.showDeviceModal = false;
        this.loadData();
      });
    } else {
      this.newDevice.dashboardId = this.activeDashId;
      this.api.addNetworkDevice(this.newDevice).subscribe(() => {
        this.showDeviceModal = false;
        this.loadData();
      });
    }
  }

  onDeleteDevice(id: string) {
    if (confirm('Удалить устройство с дашборда?')) {
      this.api.deleteNetworkDevice(id).subscribe(() => this.loadData());
    }
  }

  // --- CRUD СВЯЗИ ---
  openLinkModal() {
    this.fromDevId = '';
    this.selectedTargetIds.clear();
    this.linkType = '';
    this.linkDescription = '';
    this.showLinkModal = true;
  }
  
  toggleTarget(id: string) {
    if (this.selectedTargetIds.has(id)) this.selectedTargetIds.delete(id);
    else this.selectedTargetIds.add(id);
  }
  
  onSaveLinks() {
    if (!this.fromDevId || this.selectedTargetIds.size === 0) return;
    const toCreate = Array.from(this.selectedTargetIds).map(toId => ({
      sourceId: this.fromDevId,
      targetId: toId,
      type: this.linkType,
      description: this.linkDescription
    }));
    this.api.addNetworkLinks(toCreate).subscribe(() => {
      this.showLinkModal = false;
      this.loadData();
    });
  }

  onUpdateLink() {
    if (!this.selectedEdgeData) return;
    this.api.updateNetworkLink(this.selectedEdgeData.id, { 
      type: this.editLinkType, 
      description: this.editLinkDesc 
    }).subscribe(() => {
      this.closeSidePanel();
      this.loadData();
    });
  }

  onDeleteLink(id: string) {
    if (confirm('Удалить эту связь?')) {
      this.api.deleteNetworkLink(id).subscribe(() => {
        this.closeSidePanel();
        this.loadData();
      });
    }
  }

  // // --- СИМУЛЯТОР ---
  // simulateMonitoring() {
  //   if (!this.cyInstance || this.dashDevices.length === 0) return;
  //   let changed = false;
  //   this.dashDevices.forEach(d => {
  //     const isOnline = d.status === 'online';
  //     const random = Math.random();
  //     if (isOnline && random < 0.05) { d.status = 'offline'; changed = true; } 
  //     else if (!isOnline && random < 0.3) { d.status = 'online'; changed = true; }
  //   });
  //   if (changed) {
  //     this.zone.run(() => {
  //       this.dashDevices.forEach(d => this.cyInstance?.getElementById(d.id).data('status', d.status));
  //       this.cdr.detectChanges();
  //     });
  //   }
  // }

  // --- РЕАЛЬНЫЙ МОНИТОРИНГ: ПОЛУЧЕНИЕ АКТУАЛЬНЫХ ДАННЫХ ИЗ БД ---
  fetchRealStatuses() {
    if (!this.cyInstance || this.dashDevices.length === 0) return;
    
    // Тихо запрашиваем свежие статусы у базы данных (которую обновляет наш Node.js Poller)
    this.api.getNetworkDevices().subscribe(updatedDevices => {
      let changed = false;
      
      // Сверяем текущие устройства на карте с пришедшими из БД
      updatedDevices.forEach(freshDev => {
        const localDev = this.dashDevices.find(d => d.id === freshDev.id);
        if (localDev && localDev.status !== freshDev.status) {
          localDev.status = freshDev.status; // Обновляем локальную модель
          changed = true;
        }
      });

      // Если поллер нашел изменения — перекрашиваем графы на лету
      if (changed) {
        this.zone.run(() => {
          this.dashDevices.forEach(d => {
            this.cyInstance?.getElementById(d.id).data('status', d.status);
          });
          
          // Если открыта боковая панель с этим устройством, обновляем и ее
          if (this.selectedDevice) {
            const updated = this.dashDevices.find(d => d.id === this.selectedDevice!.id);
            if (updated) this.selectedDevice.status = updated.status;
          }
          
          this.cdr.detectChanges();
        });
      }
    });
  }

  // --- ХРАНЕНИЕ ПОЗИЦИЙ ---
  private getStorageKey(): string { return `nms_pos_${this.activeDashId}`; }
  private savePositions() {
    if (!this.cyInstance) return;
    const pos: any = {};
    this.cyInstance.nodes().forEach(n => { pos[n.id()] = n.position(); });
    localStorage.setItem(this.getStorageKey(), JSON.stringify(pos));
  }
  resetLayout() { localStorage.removeItem(this.getStorageKey()); this.onDashChange(); }

  closeSidePanel() {
    this.selectedType = null;
    this.selectedDevice = null;
    this.selectedEdgeData = null;
    if (this.cyInstance) {
      this.cyInstance.elements().unselect();
    }
  }

  // --- РЕНДЕР ГРАФА ---
  renderGraph() {
    if (!this.cyEl) return;
    if (this.cyInstance) { this.cyInstance.destroy(); this.cyInstance = null; }

    const savedPos = JSON.parse(localStorage.getItem(this.getStorageKey()) || 'null');

    const nodes = this.dashDevices.map(d => {
      const node: any = { 
        data: { 
          id: d.id, 
          name: d.name, // Имя остается внизу под квадратом без иконки
          iconSvg: this.getIconSvg(d.type), // Иконка пойдет ВНУТРЬ квадрата
          status: d.status, 
          isCollapsed: false 
        } 
      };
      if (savedPos && savedPos[d.id]) node.position = { x: savedPos[d.id].x, y: savedPos[d.id].y };
      return node;
    });

    const edges = this.dashLinks.map(l => ({
      data: { id: `link_${l.id}`, rawId: l.id, source: l.sourceId, target: l.targetId, label: l.type, description: l.description }
    }));

    this.cyInstance = cytoscape({
      container: this.cyEl.nativeElement,
      elements: [...nodes, ...edges],
      wheelSensitivity: 2.0,
      style: [
        {
          selector: 'node',
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
            
            // ИКОНКА ВНУТРИ КВАДРАТА:
            'background-image': 'data(iconSvg)',
            'background-fit': 'none',
            'background-width': '26px',
            'background-height': '26px',
            
            'border-width': 4,
            'border-color': (ele: any) => {
              const status = ele.data('status');
              if (status === 'online') return '#10b981';
              if (status === 'warning') return '#f59e0b';
              return '#ef4444';
            },
            'width': '46px',
            'height': '46px'
          }
        },
        {
          selector: 'node.collapsed',
          style: {
            'border-style': 'dashed',
            'border-color': '#8b5cf6'
          }
        },
        {
          selector: '.hidden',
          style: {
            'display': 'none'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'text-rotation': 'autorotate'
          }
        }
      ],
      layout: savedPos ? { name: 'preset' } : { name: 'cose', padding: 50 }
    });

    // СИНХРОНИЗАЦИЯ КАМЕРЫ И ФОНА ЗДАНИЯ
    const syncBackground = () => {
      if (!this.bgLayer) return;
      const zoom = this.cyInstance!.zoom();
      const pan = this.cyInstance!.pan();
      this.bgLayer.nativeElement.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
    };

    this.cyInstance.on('pan zoom', syncBackground);
    syncBackground();

    this.cyInstance.on('dragfree', 'node', () => this.savePositions());

    // ПРАВЫЙ КЛИК ПО УЗЛУ -> СВЕРНУТЬ / РАЗВЕРНУТЬ ДЕРЕВО СВЯЗЕЙ
    this.cyInstance.on('cxttap', 'node', evt => {
      const node = evt.target;
      const isCollapsed = node.hasClass('collapsed');
      
      if (isCollapsed) {
        node.removeClass('collapsed');
        node.outgoers().removeClass('hidden'); // Показываем исходящие стрелки и узлы
      } else {
        node.addClass('collapsed');
        node.outgoers().addClass('hidden'); // Прячем исходящие стрелки и узлы
      }
    });

    // КЛИК ПО УЗЛУ
    this.cyInstance.on('tap', 'node', evt => {
      const id = evt.target.id();
      this.zone.run(() => {
        this.selectedType = 'node';
        this.selectedDevice = this.dashDevices.find(d => d.id === id) || null;
        this.cdr.detectChanges();
        setTimeout(() => this.cyInstance?.resize(), 50);
      });
    });

    // КЛИК ПО ЛИНКУ
    this.cyInstance.on('tap', 'edge', evt => {
      const d = evt.target.data();
      this.zone.run(() => {
        this.selectedType = 'edge';
        const sourceDev = this.dashDevices.find(dev => dev.id === d.source);
        const targetDev = this.dashDevices.find(dev => dev.id === d.target);
        
        this.selectedEdgeData = {
          id: d.rawId,
          sourceTitle: sourceDev ? sourceDev.name : 'Unknown',
          targetTitle: targetDev ? targetDev.name : 'Unknown'
        };
        this.editLinkType = d.label;
        this.editLinkDesc = d.description || '';
        this.cdr.detectChanges();
        setTimeout(() => this.cyInstance?.resize(), 50);
      });
    });

    this.cyInstance.on('tap', evt => {
      if (evt.target === this.cyInstance) {
        this.zone.run(() => { this.closeSidePanel(); });
      }
    });
  }

  // Смена интервала опроса:
  onIntervalChange() {
    if (this.selectedIntervalType === '1s') this.refreshInterval = 1000;
    else if (this.selectedIntervalType === '5s') this.refreshInterval = 5000;
    else if (this.selectedIntervalType === '1m') this.refreshInterval = 60000;
    else if (this.selectedIntervalType === '5m') this.refreshInterval = 300000;
    else if (this.selectedIntervalType === '10m') this.refreshInterval = 600000;
    else if (this.selectedIntervalType === 'custom') this.refreshInterval = Math.max(1, this.customIntervalSec) * 1000;

    // СОХРАНЯЕМ И СРАЗУ ПОСЫЛАЕМ forcePoll ДЛЯ МГНОВЕННОГО ПЕРЕКЛЮЧЕНИЯ:
    this.api.updateNetworkSettings({
      pollIntervalMs: this.refreshInterval,
      intervalType: this.selectedIntervalType,
      customSec: this.customIntervalSec,
      forcePoll: Date.now() // Мгновенный опрос по новому времени!
    }).subscribe(() => {
      setTimeout(() => this.fetchRealStatuses(), 1500);
    });

    this.restartPollingTimer();
  }

  restartPollingTimer() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(() => this.fetchRealStatuses(), this.refreshInterval);
  }

  // Ручное обновление по кнопке:
  manualRefresh() {
    this.isRefreshing = true;
    this.cdr.detectChanges();

    // 1. Посылаем сигнал в БД: "Немедленно разбудить поллер!"
    this.api.updateNetworkSettings({ forcePoll: Date.now() }).subscribe({
      next: () => {
        // 2. Даем поллеру 1.5 секунды завершить физический пинг и забираем свежие статусы
        setTimeout(() => {
          this.fetchRealStatuses();
          this.isRefreshing = false;
          this.cdr.detectChanges();
        }, 1500);
      },
      error: () => {
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }
    });
  }
}