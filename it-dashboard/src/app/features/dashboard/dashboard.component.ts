import { Component, ElementRef, OnInit, ViewChild, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Computer, Employee, CatalogSoftware, InstalledSoftware, SoftwareLink, Department, calculateLicenseStatus } from '../../core/models';
import cytoscape, { Core } from 'cytoscape';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-page">
      <!-- ВЕРХНЯЯ ПАНЕЛЬ -->
      <div class="top-bar">
        <div class="selector-group">
          <label>🖥️ Компьютер:</label>
          <select [(ngModel)]="filterComputerId" (change)="onFilterChange()">
            @for (comp of computers; track comp.id) {
              <option [value]="comp.id">🖥️ {{ comp.name }} — {{ getEmployeeName(comp.employeeId) }}</option>
            }
          </select>
        </div>

        <!-- РЕГУЛЯТОРЫ МАСШТАБА И ИКОНОК -->
        <div class="scale-controls">
          <label>Размер иконок:</label>
          <input type="range" min="60" max="150" step="5" [(ngModel)]="nodeSize" (input)="onNodeSizeChange()" />
          <span class="size-val">{{ nodeSize }}px</span>

          <div class="zoom-btns">
            <button class="zoom-btn" (click)="zoomIn()" title="Приблизить быстро">+</button>
            <button class="zoom-btn" (click)="zoomOut()" title="Отдалить быстро">−</button>
            <button class="zoom-btn" (click)="zoomFit()" title="Вписать в экран">🎯</button>
          </div>
        </div>

        <div class="actions-group">
          <button class="btn purple" (click)="openLinkModal()">+ Связать системы (Чек-лист)</button>
          <button class="btn outline" (click)="resetLayout()" title="Сбросить сохраненные координаты">🔄 Авто-расстановка</button>
        </div>
      </div>

      <!-- МОДАЛЬНОЕ ОКНО: МАССОВЫЙ КОНСТРУКТОР СВЯЗЕЙ -->
      @if (showLinkModal) {
        <div class="modal-backdrop">
          <div class="modal wide-modal">
            <div class="modal-header">
              <div>
                <h3>🔗 Конструктор связей (Массовое подключение)</h3>
                <p class="modal-sub">Выберите источник и отметьте галочками целевые системы</p>
              </div>
              <button class="close-x-btn" (click)="showLinkModal = false">✕</button>
            </div>

            <div class="bulk-grid">
              <!-- ИСТОЧНИК -->
              <div class="source-column">
                <span class="step-badge">1. ИСТОЧНИК (Откуда)</span>
                <div class="form-group">
                  <label>Компьютер / Сервер:</label>
                  <select [(ngModel)]="fromCompId" (change)="fromInstalledId = ''">
                    <option value="" disabled selected>Выберите компьютер...</option>
                    @for (c of computers; track c.id) {
                      <option [value]="c.id">{{ c.name }} ({{ getEmployeeName(c.employeeId) }})</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>Программа на этом ПК:</label>
                  <select [(ngModel)]="fromInstalledId" [disabled]="!fromCompId">
                    <option value="" disabled selected>Выберите ПО...</option>
                    @for (inst of getSoftwareByComp(fromCompId); track inst.id) {
                      <option [value]="inst.id">{{ getSoftwareName(inst.softwareCatalogId) }} (v{{ inst.version }})</option>
                    }
                  </select>
                </div>

                <div class="form-group" style="margin-top: 18px;">
                  <label>Протокол / Порт / Тип связи:</label>
                  <input [(ngModel)]="linkType" placeholder="например: 1433, REST API, ODBC" />
                </div>

                <div class="form-group">
                  <label>Описание назначения:</label>
                  <textarea [(ngModel)]="linkDescription" rows="3" placeholder="Зачем создается связь..."></textarea>
                </div>
              </div>

              <!-- ЦЕЛИ (ЧЕК-ЛИСТ) -->
              <div class="target-column">
                <div class="target-head">
                  <span class="step-badge target">2. ЦЕЛИ (Куда — отметьте галочками)</span>
                  <div class="target-actions">
                    <button class="link-btn-sm" (click)="selectAllTargets()">Выбрать все</button>
                    <button class="link-btn-sm" (click)="clearAllTargets()">Снять все</button>
                  </div>
                </div>

                <div class="target-filter" style="display: flex; gap: 8px;">
                  <!-- Выпадающий список выбора сотрудника -->
                  <select [(ngModel)]="targetEmployeeFilter" style="width: 180px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;">
                    <option value="ALL">Все сотрудники</option>
                    @for (emp of employees; track emp.id) {
                      <option [value]="emp.id">👤 {{ emp.name }}</option>
                    }
                  </select>

                  <!-- Поле поиска -->
                  <input style="flex: 1;" [(ngModel)]="targetSearch" placeholder="🔍 Поиск по ПК или ПО..." />
                </div>

                <div class="target-checklist">
                  @for (inst of filteredTargets; track inst.id) {
                    <label class="check-item" [class.selected]="selectedTargetIds.has(inst.id)">
                      <input 
                        type="checkbox" 
                        [checked]="selectedTargetIds.has(inst.id)" 
                        (change)="toggleTarget(inst.id)"
                        [disabled]="inst.id === fromInstalledId"
                      />
                      <div class="check-info">
                        <b>{{ getSoftwareName(inst.softwareCatalogId) }}</b> <small>v{{ inst.version }}</small>
                        <div class="check-meta">
                          🖥️ {{ getCompName(inst.computerId) }} ({{ getEmployeeNameByComp(inst.computerId) }})
                        </div>
                      </div>
                    </label>
                  } @empty {
                    <div class="empty-targets">Нет доступных систем по поиску</div>
                  }
                </div>

                <div class="selected-count">
                  Выбрано систем: <b>{{ selectedTargetIds.size }}</b>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn gray" (click)="showLinkModal = false">Отмена</button>
              <button class="btn blue" (click)="onSaveBulkLinks()" [disabled]="!fromInstalledId || selectedTargetIds.size === 0 || !linkType">
                @if (isSaving) { Создание связей... } @else { Создать связи ({{ selectedTargetIds.size }} шт.) }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- КАРТА И ПРАВАЯ ПАНЕЛЬ -->
      <div class="graph-layout">
        <div class="canvas-box">
          <div class="legend">
            <span class="dot active"></span> Лицензия ОК
            <span class="dot warning"></span> Истекает (<30 дн)
            <span class="dot danger"></span> Просрочено
            <span class="hint">💡 Карта сфокусирована на выбранном ПК. Кликните на узел или стрелку для описания.</span>
          </div>

          <div class="cy-container">
            @if (isLoading) {
              <div class="loader-overlay">
                <div class="spinner"></div>
                <p>Загрузка топологии компьютера...</p>
              </div>
            }
            <div #cy id="cy"></div>
          </div>
        </div>

        <!-- КАРТОЧКА ОБОРУДОВАНИЯ И ПО -->
        @if (selectedType === 'node' && selectedNodeData) {
          <aside class="side-panel">
            <div class="panel-head">
              <h4>📦 {{ selectedNodeData.softwareName }}</h4>
              <button (click)="closeSidePanel()">✕</button>
            </div>

            <div class="status-box" [ngClass]="selectedNodeData.status.status">
              {{ selectedNodeData.status.label }}
            </div>

            <div class="section-title">🖥️ Оборудование и рабочее место</div>
            <div class="meta-row"><label>Компьютер / Хост:</label> <b>{{ selectedNodeData.compName }}</b></div>
            <div class="meta-row"><label>Сетевой IP:</label> <code>{{ selectedNodeData.ip }}</code></div>
            <div class="meta-row"><label>Отдел:</label> <b>{{ selectedNodeData.deptName }}</b></div>
            <div class="meta-row"><label>Сотрудник:</label> <b>{{ selectedNodeData.empName }}</b></div>

            <div class="section-title">🔑 Данные лицензии</div>
            <div class="meta-row"><label>Версия программы:</label> <b>{{ selectedNodeData.version }}</b></div>
            <div class="meta-row"><label>Ключ доступа:</label> <code>{{ selectedNodeData.key }}</code></div>
            <div class="meta-row"><label>Окончание лицензии:</label> <b>{{ selectedNodeData.expiryDate || 'Бессрочно' }}</b></div>

            <div class="impact">
              <h5>Связи этой системы ({{ selectedNodeConnections.length }}):</h5>
              <ul>
                @for (conn of selectedNodeConnections; track conn.id) {
                  <li class="link-card">
                    <div class="link-info">
                      <span class="direction">
                        {{ conn.fromInstalledId === selectedNodeData.id ? '➡️ Исходящая в:' : '⬅️ Входящая из:' }}
                      </span>
                      <b>{{ getSoftwareTitleByInstId(conn.fromInstalledId === selectedNodeData.id ? conn.toInstalledId : conn.fromInstalledId) }}</b>
                      <span class="proto">{{ conn.type }}</span>
                      @if (conn.description) {
                        <p class="desc">{{ conn.description }}</p>
                      }
                    </div>
                    <div class="card-actions">
                      <button class="action-btn" (click)="openEditLink(conn)" title="Редактировать связь">✏️</button>
                      <button class="action-btn del" (click)="onDeleteLink(conn.id)" title="Удалить эту связь">🗑️</button>
                    </div>
                  </li>
                } @empty {
                  <li class="empty-links">Нет зарегистрированных связей</li>
                }
              </ul>
            </div>
          </aside>
        }

        <!-- КАРТОЧКА СВЯЗИ + РЕДАКТИРОВАНИЕ -->
        @if (selectedType === 'edge' && selectedEdgeData) {
          <aside class="side-panel edge-panel">
            <div class="panel-head">
              <h4>🔗 Свойства связи</h4>
              <button (click)="closeSidePanel()">✕</button>
            </div>

            <div class="edge-flow">
              <div class="flow-box">
                <span class="flow-lbl">Откуда (Источник):</span>
                <p><b>{{ selectedEdgeData.sourceTitle }}</b></p>
              </div>
              <div class="flow-arrow">⬇️</div>
              <div class="flow-box">
                <span class="flow-lbl">Куда (Назначение):</span>
                <p><b>{{ selectedEdgeData.targetTitle }}</b></p>
              </div>
            </div>

            <div class="section-title">✏️ Редактирование параметров связи:</div>
            
            <div class="form-group">
              <label>Протокол / Порт / Название связи:</label>
              <input [(ngModel)]="editLinkType" placeholder="1433, REST API..." />
            </div>

            <div class="form-group">
              <label>Описание назначения связи:</label>
              <textarea [(ngModel)]="editLinkDesc" rows="3" placeholder="Подробное назначение..."></textarea>
            </div>

            <div class="edge-actions-btns">
              <button class="btn blue" (click)="onUpdateLink()" [disabled]="!editLinkType || isUpdating">
                @if (isUpdating) { Сохранение... } @else { 💾 Сохранить изменения }
              </button>
              <button class="btn-del-full" (click)="onDeleteLink(selectedEdgeData.id)">
                🗑️ Удалить эту связь
              </button>
            </div>
          </aside>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow: hidden; }
    .dash-page { 
      padding: 16px 20px; 
      height: calc(100vh - 64px); 
      display: flex; 
      flex-direction: column; 
      box-sizing: border-box; 
      overflow: hidden;
      max-width: 100vw;
    }

    .top-bar { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      background: white; 
      padding: 10px 18px; 
      border-radius: 8px; 
      border: 1px solid #e2e8f0; 
      margin-bottom: 12px; 
      gap: 14px; 
      flex-shrink: 0;
    }
    .selector-group { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 13px; }
    .selector-group select { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; min-width: 280px; background: #fff; font-size: 13px; }
    
    .scale-controls { display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 4px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 12px; }
    .scale-controls label { font-weight: 600; color: #475569; }
    .scale-controls input[type="range"] { width: 90px; cursor: pointer; }
    .size-val { font-family: monospace; font-weight: bold; color: #2563eb; width: 38px; }
    .zoom-btns { display: flex; gap: 4px; border-left: 1px solid #cbd5e1; padding-left: 8px; }
    .zoom-btn { width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .zoom-btn:hover { background: #e2e8f0; }

    .actions-group { display: flex; gap: 8px; margin-left: auto; }
    .btn { padding: 8px 14px; border-radius: 6px; font-weight: bold; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn.purple { background: #7c3aed; color: white; }
    .btn.purple:hover { background: #6d28d9; }
    .btn.outline { background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; }
    .btn.outline:hover { background: #e2e8f0; }
    .btn.blue { background: #2563eb; color: white; }
    .btn.gray { background: #e2e8f0; color: #475569; }

    .graph-layout { 
      flex: 1; 
      display: flex; 
      gap: 14px; 
      min-height: 0; 
      min-width: 0; 
      overflow: hidden; 
      position: relative;
    }

    .canvas-box { 
      flex: 1; 
      min-width: 0; 
      display: flex; 
      flex-direction: column; 
      background: white; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 12px; 
      position: relative; 
      overflow: hidden;
    }

    .legend { display: flex; gap: 12px; align-items: center; font-size: 12px; margin-bottom: 8px; color: #475569; flex-shrink: 0; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .active { background: #10b981; }
    .warning { background: #f59e0b; }
    .danger { background: #ef4444; }
    .hint { margin-left: auto; font-style: italic; color: #64748b; font-size: 12px; }

    .cy-container { flex: 1; width: 100%; height: 100%; position: relative; min-height: 0; }
    #cy { width: 100%; height: 100%; border-radius: 6px; cursor: grab; }
    #cy:active { cursor: grabbing; }

    .loader-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; border-radius: 6px; }
    .spinner { width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .loader-overlay p { margin-top: 12px; font-size: 13px; color: #475569; font-weight: 500; }

    .side-panel { 
      width: 370px; 
      flex-shrink: 0; 
      background: white; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 18px; 
      overflow-y: auto; 
      box-shadow: -2px 0 10px rgba(0,0,0,0.04);
      animation: slideIn 0.15s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .panel-head h4 { margin: 0; font-size: 16px; color: #0f172a; }
    .panel-head button { background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8; }
    
    .status-box { padding: 6px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-bottom: 14px; text-align: center; }
    .status-box.active { background: #dcfce7; color: #166534; }
    .status-box.warning { background: #fef9c3; color: #854d0e; }
    .status-box.danger { background: #fee2e2; color: #991b1b; }

    .section-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin: 14px 0 6px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
    .meta-row { margin-bottom: 6px; font-size: 13px; }
    .meta-row label { color: #64748b; display: block; font-size: 11px; }
    .meta-row code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 12px; }

    .edge-flow { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
    .flow-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; }
    .flow-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 2px; }
    .flow-box p { margin: 0; font-size: 13px; color: #1e293b; }
    .flow-arrow { text-align: center; font-size: 14px; margin: -2px 0; }
    
    .edge-actions-btns { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .btn-del-full { width: 100%; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    .btn-del-full:hover { background: #fecaca; }

    .impact { margin-top: 14px; }
    .impact h5 { margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; }
    .impact ul { list-style: none; padding: 0; margin: 0; }
    .link-card { display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; }
    .link-info { font-size: 12px; flex: 1; }
    .link-info .direction { display: block; font-size: 10px; color: #64748b; margin-bottom: 2px; }
    .link-info .proto { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-top: 4px; }
    .link-info .desc { margin: 4px 0 0; color: #64748b; font-size: 11px; }
    .card-actions { display: flex; gap: 4px; margin-left: 8px; }
    .action-btn { background: none; border: none; font-size: 13px; cursor: pointer; padding: 3px; border-radius: 4px; }
    .action-btn:hover { background: #e2e8f0; }
    .action-btn.del:hover { background: #fee2e2; }
    .empty-links { color: #94a3b8; font-style: italic; font-size: 12px; }

    /* МОДАЛКА */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .wide-modal { width: 840px; max-width: 95vw; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .modal-header h3 { margin: 0 0 4px; font-size: 18px; color: #0f172a; }
    .modal-sub { margin: 0; font-size: 13px; color: #64748b; }
    .close-x-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8; }
    
    .bulk-grid { display: grid; grid-template-columns: 340px 1fr; gap: 18px; }
    .source-column { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
    .target-column { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: white; display: flex; flex-direction: column; }
    
    .step-badge { display: inline-block; font-size: 11px; font-weight: bold; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; margin-bottom: 10px; }
    .step-badge.target { background: #ede9fe; color: #5b21b6; }
    .target-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .target-actions { display: flex; gap: 8px; }
    .link-btn-sm { background: none; border: none; color: #2563eb; font-size: 11px; cursor: pointer; text-decoration: underline; font-weight: 600; padding: 0; }
    
    .target-filter { margin-bottom: 10px; }
    .target-filter input { width: 100%; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; box-sizing: border-box; }
    
    .target-checklist { flex: 1; max-height: 270px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
    .check-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; border: 1px solid transparent; }
    .check-item:hover { background: #f1f5f9; }
    .check-item.selected { background: #eff6ff; border-color: #bfdbfe; }
    .check-item input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .check-info { font-size: 13px; line-height: 1.3; }
    .check-meta { font-size: 11px; color: #64748b; }
    .empty-targets { padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
    .selected-count { margin-top: 10px; font-size: 12px; color: #475569; text-align: right; }

    .form-group { margin-bottom: 10px; }
    .form-group label { display: block; font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #475569; }
    .form-group select, .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 13px; background: white; font-family: inherit; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
  `]
})
export class DashboardComponent implements OnInit {
  @ViewChild('cy', { static: false }) cyEl!: ElementRef;
  
  private api = inject(ApiService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  private cyInstance: Core | null = null;

  isLoading = true;
  isSaving = false;
  isUpdating = false;

  departments: Department[] = [];
  computers: Computer[] = [];
  employees: Employee[] = [];
  catalog: CatalogSoftware[] = [];
  allInstalled: InstalledSoftware[] = [];
  links: SoftwareLink[] = [];

  filterComputerId = ''; // Теперь здесь всегда конкретный компьютер!
  nodeSize = 95;

  // Модалка массового добавления
  showLinkModal = false;
  fromCompId = '';
  fromInstalledId = '';
  targetSearch = '';
  targetEmployeeFilter = 'ALL';
  selectedTargetIds = new Set<string>();
  linkType = '';
  linkDescription = '';

  // Редактирование существующей связи
  selectedType: 'node' | 'edge' | null = null;
  selectedNodeData: any = null;
  selectedNodeConnections: SoftwareLink[] = [];
  selectedEdgeData: any = null;
  editLinkType = '';
  editLinkDesc = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.api.getAllData().subscribe({
      next: data => {
        this.departments = data.departments;
        this.computers = data.computers;
        this.employees = data.employees;
        this.catalog = data.catalog;
        this.allInstalled = data.installed;
        this.links = data.links;

        // Автоматически выбираем первый компьютер из базы
        if (this.computers.length > 0) {
          if (!this.filterComputerId || !this.computers.some(c => c.id === this.filterComputerId)) {
            this.filterComputerId = this.computers[0].id;
          }
        }

        this.onFilterChange();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEmployee(empId: string): Employee | undefined {
    return this.employees.find(e => e.id === empId);
  }

  getEmployeeName(empId: string): string {
    return this.getEmployee(empId)?.name || 'Не назначен';
  }

  getEmployeeNameByComp(compId: string): string {
    const comp = this.computers.find(c => c.id === compId);
    return comp ? this.getEmployeeName(comp.employeeId) : '';
  }

  getDepartmentName(empId: string): string {
    const emp = this.getEmployee(empId);
    if (!emp) return 'Не указан';
    return this.departments.find(d => d.id === emp.departmentId)?.name || 'Не указан';
  }

  getSoftwareName(catId: string): string {
    return this.catalog.find(c => c.id === catId)?.name || 'ПО';
  }

  getCompName(compId: string): string {
    return this.computers.find(c => c.id === compId)?.name || 'ПК';
  }

  getSoftwareByComp(compId: string): InstalledSoftware[] {
    return this.allInstalled.filter(i => i.computerId === compId);
  }

  getSoftwareTitleByInstId(instId: string): string {
    const inst = this.allInstalled.find(i => i.id === instId);
    if (!inst) return 'Неизвестно';
    return `${this.getSoftwareName(inst.softwareCatalogId)} [${this.getCompName(inst.computerId)}]`;
  }

  onFilterChange() {
    this.closeSidePanel();
    this.cdr.detectChanges();

    setTimeout(() => {
      this.renderGraph();
    }, 50);
  }

  onNodeSizeChange() {
    if (!this.cyInstance) return;
    const fontSize = Math.max(9, Math.round(this.nodeSize * 0.11));
    this.cyInstance.nodes().style({
      'width': `${this.nodeSize}px`,
      'height': `${this.nodeSize}px`,
      'font-size': `${fontSize}px`
    });
  }

  zoomIn() {
    if (this.cyInstance) {
      this.cyInstance.zoom(this.cyInstance.zoom() * 1.4);
    }
  }

  zoomOut() {
    if (this.cyInstance) {
      this.cyInstance.zoom(this.cyInstance.zoom() * 0.7);
    }
  }

  zoomFit() {
    if (this.cyInstance) {
      this.cyInstance.fit(undefined, 40);
    }
  }

  closeSidePanel() {
    this.selectedType = null;
    this.selectedNodeData = null;
    this.selectedEdgeData = null;
    if (this.cyInstance) {
      this.cyInstance.elements().unselect();
      setTimeout(() => {
        this.cyInstance?.resize();
      }, 50);
    }
  }

  openLinkModal() {
    this.fromCompId = this.filterComputerId || (this.computers[0]?.id ?? '');
    this.fromInstalledId = '';
    this.targetSearch = '';
    this.selectedTargetIds.clear();
    this.linkType = '';
    this.linkDescription = '';
    this.showLinkModal = true;
  }

  get filteredTargets(): InstalledSoftware[] {
  const term = this.targetSearch.toLowerCase().trim();
  return this.allInstalled.filter(inst => {
    if (inst.id === this.fromInstalledId) return false;

    // ФИЛЬТРАЦИЯ ПО СОТРУДНИКУ:
    if (this.targetEmployeeFilter !== 'ALL') {
      const comp = this.computers.find(c => c.id === inst.computerId);
      if (!comp || comp.employeeId !== this.targetEmployeeFilter) {
        return false;
      }
    }

    if (!term) return true;
    const swName = this.getSoftwareName(inst.softwareCatalogId).toLowerCase();
    const cName = this.getCompName(inst.computerId).toLowerCase();
    const empName = this.getEmployeeNameByComp(inst.computerId).toLowerCase();
    return swName.includes(term) || cName.includes(term) || empName.includes(term);
  });
}

  toggleTarget(instId: string) {
    if (this.selectedTargetIds.has(instId)) {
      this.selectedTargetIds.delete(instId);
    } else {
      this.selectedTargetIds.add(instId);
    }
  }

  selectAllTargets() {
    this.filteredTargets.forEach(t => this.selectedTargetIds.add(t.id));
  }

  clearAllTargets() {
    this.selectedTargetIds.clear();
  }

  onSaveBulkLinks() {
    if (!this.fromInstalledId || this.selectedTargetIds.size === 0 || !this.linkType) return;
    this.isSaving = true;

    const linksToCreate = Array.from(this.selectedTargetIds).map(toId => ({
      fromInstalledId: this.fromInstalledId,
      toInstalledId: toId,
      type: this.linkType,
      description: this.linkDescription
    }));

    this.api.addMultipleLinks(linksToCreate).subscribe({
      next: createdLinks => {
        this.links.push(...createdLinks);
        this.showLinkModal = false;
        this.isSaving = false;
        this.renderGraph();
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  openEditLink(link: SoftwareLink) {
    this.selectedType = 'edge';
    this.selectedNodeData = null;
    this.selectedEdgeData = {
      id: link.id,
      label: link.type,
      sourceTitle: this.getSoftwareTitleByInstId(link.fromInstalledId),
      targetTitle: this.getSoftwareTitleByInstId(link.toInstalledId),
      description: link.description
    };
    this.editLinkType = link.type;
    this.editLinkDesc = link.description || '';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.cyInstance?.resize();
    }, 50);
  }

  onUpdateLink() {
    if (!this.selectedEdgeData || !this.editLinkType) return;
    this.isUpdating = true;

    this.api.updateLink(this.selectedEdgeData.id, {
      type: this.editLinkType,
      description: this.editLinkDesc
    }).subscribe({
      next: updated => {
        const idx = this.links.findIndex(l => l.id === updated.id);
        if (idx !== -1) {
          this.links[idx] = updated;
        }
        this.selectedEdgeData.label = updated.type;
        this.selectedEdgeData.description = updated.description;
        this.isUpdating = false;
        this.renderGraph();
      },
      error: () => {
        this.isUpdating = false;
      }
    });
  }

  onDeleteLink(linkId: string) {
    if (confirm('Удалить эту связь между системами?')) {
      this.api.deleteLink(linkId).subscribe(() => {
        this.links = this.links.filter(l => l.id !== linkId);
        this.closeSidePanel();
        this.renderGraph();
      });
    }
  }

  private getStorageKey(): string {
    return `cmdb_positions_${this.filterComputerId}`;
  }

  private savePositions() {
    if (!this.cyInstance) return;
    const positions: { [key: string]: { x: number; y: number } } = {};
    this.cyInstance.nodes().forEach(node => {
      positions[node.id()] = node.position();
    });
    localStorage.setItem(this.getStorageKey(), JSON.stringify(positions));
  }

  private getSavedPositions(): { [key: string]: { x: number; y: number } } | null {
    const raw = localStorage.getItem(this.getStorageKey());
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  resetLayout() {
    localStorage.removeItem(this.getStorageKey());
    this.renderGraph(true);
  }

  private renderGraph(forceResetLayout = false) {
    if (!this.cyEl) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.cyInstance) {
      this.cyInstance.destroy();
      this.cyInstance = null;
    }

    // Если компьютеров вообще нет в базе
    if (!this.filterComputerId || this.computers.length === 0) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    // СТРОГО ДЛЯ ВЫБРАННОГО КОМПЬЮТЕРА:
    const compInstIds = this.allInstalled
      .filter(i => i.computerId === this.filterComputerId)
      .map(i => i.id);

    // Связи, где участвует этот компьютер
    const activeLinks = this.links.filter(
      l => compInstIds.includes(l.fromInstalledId) || compInstIds.includes(l.toInstalledId)
    );

    // Узлы: программы этого ПК + смежные сервисы
    const relatedIds = new Set<string>([...compInstIds]);
    activeLinks.forEach(l => {
      relatedIds.add(l.fromInstalledId);
      relatedIds.add(l.toInstalledId);
    });

    const activeInstalled = this.allInstalled.filter(i => relatedIds.has(i.id));
    const savedPos = forceResetLayout ? null : this.getSavedPositions();

    const nodes = activeInstalled.map(inst => {
      const comp = this.computers.find(c => c.id === inst.computerId);
      const swName = this.getSoftwareName(inst.softwareCatalogId);
      const cName = comp ? comp.name : 'ПК';
      const ip = comp ? comp.ip : '-';
      const empName = comp ? this.getEmployeeName(comp.employeeId) : '';
      const deptName = comp ? this.getDepartmentName(comp.employeeId) : '';
      const statusObj = calculateLicenseStatus(inst.expiryDate);

      const nodeObj: any = {
        data: {
          id: inst.id,
          name: `${swName}\n[${cName}]\n${empName}`,
          rawSwName: swName,
          compName: cName,
          ip: ip,
          deptName: deptName,
          empName: empName,
          version: inst.version,
          key: inst.licenseKey,
          expiryDate: inst.expiryDate,
          status: statusObj,
          isFilteredTarget: inst.computerId === this.filterComputerId
        }
      };

      if (savedPos && savedPos[inst.id]) {
        nodeObj.position = { x: savedPos[inst.id].x, y: savedPos[inst.id].y };
      }

      return nodeObj;
    });

    const edges = activeLinks.map(link => ({
      data: {
        id: `link_${link.id}`,
        rawLinkId: link.id,
        source: link.fromInstalledId,
        target: link.toInstalledId,
        label: link.type,
        description: link.description || ''
      }
    }));

    const layoutConfig: any = (savedPos && Object.keys(savedPos).length > 0)
      ? { name: 'preset' }
      : {
          name: 'circle',
          padding: 60,
          spacingFactor: 1.3
        };

    const fontSize = Math.max(9, Math.round(this.nodeSize * 0.11));

    this.cyInstance = cytoscape({
      container: this.cyEl.nativeElement,
      elements: [...nodes, ...edges],
      wheelSensitivity: 2.5,
      minZoom: 0.1,
      maxZoom: 5.0,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(name)',
            'text-valign': 'center',
            'text-wrap': 'wrap',
            'color': '#ffffff',
            'font-size': `${fontSize}px`,
            'font-weight': 'bold',
            'text-outline-width': 1.2,
            'text-outline-color': '#0f172a',
            'background-color': (ele: any) => {
              const status = ele.data('status').status;
              if (status === 'danger') return '#ef4444';
              if (status === 'warning') return '#f59e0b';
              return '#10b981';
            },
            'border-width': (ele: any) => ele.data('isFilteredTarget') ? 4 : 1.5,
            'border-color': (ele: any) => ele.data('isFilteredTarget') ? '#2563eb' : '#cbd5e1',
            'width': `${this.nodeSize}px`,
            'height': `${this.nodeSize}px`
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#facc15'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': '#7c3aed',
            'target-arrow-color': '#7c3aed',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-background-padding': '3px',
            'color': '#334155'
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 4.5,
            'line-color': '#2563eb',
            'target-arrow-color': '#2563eb',
            'color': '#2563eb'
          }
        }
      ],
      layout: layoutConfig
    });

    this.cyInstance.on('dragfree', 'node', () => {
      this.savePositions();
    });

    this.cyInstance.on('tap', 'node', evt => {
      const d = evt.target.data();
      this.zone.run(() => {
        this.selectedType = 'node';
        this.selectedEdgeData = null;
        this.selectedNodeData = {
          id: d.id,
          softwareName: d.rawSwName,
          compName: d.compName,
          ip: d.ip,
          deptName: d.deptName,
          empName: d.empName,
          version: d.version,
          key: d.key,
          expiryDate: d.expiryDate,
          status: d.status
        };
        this.selectedNodeConnections = this.links.filter(
          l => l.fromInstalledId === d.id || l.toInstalledId === d.id
        );
        this.cdr.detectChanges();

        setTimeout(() => {
          this.cyInstance?.resize();
        }, 50);
      });
    });

    this.cyInstance.on('tap', 'edge', evt => {
      const edge = evt.target;
      const d = edge.data();
      this.zone.run(() => {
        this.selectedType = 'edge';
        this.selectedNodeData = null;
        this.selectedEdgeData = {
          id: d.rawLinkId,
          label: d.label,
          sourceTitle: this.getSoftwareTitleByInstId(d.source),
          targetTitle: this.getSoftwareTitleByInstId(d.target),
          description: d.description
        };
        this.editLinkType = d.label;
        this.editLinkDesc = d.description || '';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.cyInstance?.resize();
        }, 50);
      });
    });

    this.cyInstance.on('tap', evt => {
      if (evt.target === this.cyInstance) {
        this.zone.run(() => {
          this.closeSidePanel();
          this.cdr.detectChanges();
        });
      }
    });

    this.isLoading = false;
    this.cdr.detectChanges();
  }
}