import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Computer, Employee, CatalogSoftware, InstalledSoftware, Department, calculateLicenseStatus } from '../../core/models';

@Component({
  selector: 'app-computers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comp-page">
      <div class="page-header">
        <div>
          <h2>💻 Оборудование (Компьютеры) и Установленное ПО</h2>
          <p class="subtitle">Учет рабочих мест, привязка к сотрудникам и мониторинг лицензий</p>
        </div>
        <div class="header-btns">
          <button class="btn blue" (click)="showCompModal = true">+ Добавить Компьютер</button>
          <button class="btn green" (click)="showInstallModal = true">+ Установить ПО на ПК</button>
        </div>
      </div>

      <!-- ПАНЕЛЬ ПОИСКА И ФИЛЬТРОВ -->
      <div class="filters-card">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Поиск по имени ПК, IP-адресу, сотруднику или установленному ПО..." 
          />
          @if (searchQuery) {
            <button class="clear-btn" (click)="searchQuery = ''">✕</button>
          }
        </div>

        <div class="select-filters">
          <!-- ФИЛЬТР ПО ОТДЕЛУ -->
          <div class="filter-item">
            <label>Отдел:</label>
            <select [(ngModel)]="selectedDeptFilter">
              <option value="ALL">Все отделы</option>
              @for (d of departments; track d.id) {
                <option [value]="d.id">{{ d.name }}</option>
              }
            </select>
          </div>

          <!-- ФИЛЬТР ПО СТАТУСУ ЛИЦЕНЗИЙ -->
          <div class="filter-item">
            <label>Лицензии:</label>
            <select [(ngModel)]="selectedStatusFilter">
              <option value="ALL">Все компьютеры</option>
              <option value="PROBLEMS">⚠️ Требуют продления (<30 дн или просрочено)</option>
              <option value="ACTIVE">✅ Только в порядке</option>
            </select>
          </div>

          @if (searchQuery || selectedDeptFilter !== 'ALL' || selectedStatusFilter !== 'ALL') {
            <button class="reset-filter-btn" (click)="resetFilters()">Сбросить фильтры</button>
          }
        </div>

        <div class="stats-pills">
          <span class="stat-pill">Найдено: <b>{{ filteredComputers.length }}</b> из {{ computers.length }} ПК</span>
          @if (problemCount > 0) {
            <span class="stat-pill warn">⚠️ Требуют внимания: <b>{{ problemCount }}</b> ПК</span>
          }
        </div>
      </div>

      <!-- КРУТИЛКА ЗАГРУЗКИ -->
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка списка оборудования и лицензий...</p>
        </div>
      } @else {
        <!-- СПИСОК КОМПЬЮТЕРОВ С УСТАНОВЛЕННЫМ ПО -->
        <div class="computers-grid">
          @for (comp of filteredComputers; track comp.id) {
            <div class="comp-card">
              <div class="comp-head">
                <div>
                  <h4>🖥️ {{ comp.name }}</h4>
                  <div class="comp-meta">
                    IP: <code>{{ comp.ip }}</code> | 👤 <b>{{ getEmployeeName(comp.employeeId) }}</b>
                    <span class="dept-tag">({{ getDepartmentName(comp.employeeId) }})</span>
                  </div>
                </div>
                <button class="del-btn" (click)="onDeleteComp(comp.id)" title="Удалить компьютер">✕</button>
              </div>

              <div class="software-installed-list">
                <h5>Установленное ПО на этом ПК:</h5>
                @for (inst of getInstalledForComp(comp.id); track inst.id) {
                  <div class="inst-item">
                    <div class="inst-info">
                      <span class="inst-name">{{ getSoftwareName(inst.softwareCatalogId) }}</span>
                      <span class="inst-ver">v{{ inst.version }}</span>
                      @if (inst.licenseKey) {
                        <span class="key-code">🔑 {{ inst.licenseKey }}</span>
                      }
                    </div>
                    <div class="inst-status">
                      <span class="badge" [ngClass]="calcStatus(inst.expiryDate).status">
                        {{ calcStatus(inst.expiryDate).label }}
                      </span>
                      <!-- КНОПКА РЕДАКТИРОВАНИЯ -->
                      <button class="edit-sw-btn" (click)="openEditInstall(inst)" title="Редактировать ключ и дату">✏️</button>
                      <button class="remove-sw-btn" (click)="onDeleteInstall(inst.id)" title="Удалить это ПО с компьютера">✕</button>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-inst">На этом компьютере еще не зарегистрировано ПО</div>
                }
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>🔍 По заданным фильтрам ничего не найдено.</p>
              <button class="btn blue" (click)="resetFilters()">Сбросить фильтры</button>
            </div>
          }
        </div>
      }

      <!-- МОДАЛЬНОЕ ОКНО: РЕДАКТИРОВАНИЕ КЛЮЧА И ЛИЦЕНЗИИ -->
      @if (showEditInstallModal && editingInstall) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3>✏️ Редактирование лицензии ПО</h3>
            <p style="margin: 0 0 14px; font-size: 13px; color: #64748b;">
              Программа: <b>{{ getSoftwareName(editingInstall.softwareCatalogId) }}</b>
            </p>

            <div class="form-group">
              <label>Версия программы:</label>
              <input [(ngModel)]="editingInstall.version" placeholder="8.3.24" />
            </div>

            <div class="form-group">
              <label>Ключ доступа / Лицензия:</label>
              <input [(ngModel)]="editingInstall.licenseKey" placeholder="KEY-XXXX-YYYY" />
            </div>

            <div class="form-group">
              <label>Срок окончания лицензии:</label>
              <input type="date" [(ngModel)]="editingInstall.expiryDate" />
            </div>

            <div class="modal-actions">
              <button class="btn gray" (click)="showEditInstallModal = false">Отмена</button>
              <button class="btn blue" (click)="onUpdateInstall()">
                @if (isSaving) { Сохранение... } @else { 💾 Сохранить изменения }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- МОДАЛЬНОЕ ОКНО: ДОБАВИТЬ ПК -->
      @if (showCompModal) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3>Регистрация нового компьютера</h3>
            <div class="form-group">
              <label>Имя компьютера (Hostname):</label>
              <input [(ngModel)]="newComp.name" placeholder="например: Grosver-44" />
            </div>
            <div class="form-group">
              <label>IP Адрес:</label>
              <input [(ngModel)]="newComp.ip" placeholder="192.168.1.50" />
            </div>
            <div class="form-group">
              <label>Ответственный сотрудник:</label>
              <select [(ngModel)]="newComp.employeeId">
                <option value="" disabled selected>Выберите сотрудника...</option>
                @for (emp of employees; track emp.id) {
                  <option [value]="emp.id">{{ emp.name }} ({{ getDeptNameById(emp.departmentId) }})</option>
                }
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn gray" (click)="showCompModal = false">Отмена</button>
              <button class="btn blue" (click)="onSaveComputer()">
                @if (isSaving) { Сохранение... } @else { Сохранить }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- МОДАЛЬНОЕ ОКНО: УСТАНОВИТЬ ПО -->
      @if (showInstallModal) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3>Установка ПО на компьютер</h3>
            <div class="form-group">
              <label>На какой компьютер:</label>
              <select [(ngModel)]="newInstall.computerId">
                <option value="" disabled selected>Выберите компьютер...</option>
                @for (c of computers; track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ getEmployeeName(c.employeeId) }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Программа из справочника:</label>
              <select [(ngModel)]="newInstall.softwareCatalogId">
                <option value="" disabled selected>Выберите программу...</option>
                @for (s of catalog; track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Версия:</label>
              <input [(ngModel)]="newInstall.version" placeholder="8.3.24" />
            </div>
            <div class="form-group">
              <label>Ключ доступа / Лицензия:</label>
              <input [(ngModel)]="newInstall.licenseKey" placeholder="KEY-XXXX-YYYY" />
            </div>
            <div class="form-group">
              <label>Срок окончания лицензии:</label>
              <input type="date" [(ngModel)]="newInstall.expiryDate" />
            </div>
            <div class="modal-actions">
              <button class="btn gray" (click)="showInstallModal = false">Отмена</button>
              <button class="btn green" (click)="onSaveInstall()">
                @if (isSaving) { Установка... } @else { Установить }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .comp-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h2 { margin: 0 0 4px; font-size: 22px; color: #1e293b; }
    .subtitle { margin: 0; font-size: 14px; color: #64748b; }
    .header-btns { display: flex; gap: 10px; }
    .btn { padding: 10px 18px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; transition: all 0.2s; font-size: 13px; }
    .btn.blue { background: #2563eb; color: white; }
    .btn.blue:hover { background: #1d4ed8; }
    .btn.green { background: #10b981; color: white; }
    .btn.green:hover { background: #059669; }
    .btn.gray { background: #e2e8f0; color: #475569; }

    /* ПАНЕЛЬ ФИЛЬТРОВ И ПОИСКА */
    .filters-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .search-input-wrap { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 12px; font-size: 14px; color: #94a3b8; }
    .search-input-wrap input { width: 100%; padding: 10px 36px 10px 38px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .clear-btn { position: absolute; right: 10px; background: none; border: none; font-size: 14px; cursor: pointer; color: #94a3b8; }
    
    .select-filters { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .filter-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #475569; }
    .filter-item select { padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; background: white; }
    .reset-filter-btn { background: none; border: none; color: #2563eb; font-size: 12px; cursor: pointer; text-decoration: underline; font-weight: 600; }

    .stats-pills { display: flex; gap: 10px; font-size: 12px; }
    .stat-pill { background: #f1f5f9; padding: 4px 10px; border-radius: 14px; color: #475569; }
    .stat-pill.warn { background: #fef3c7; color: #92400e; font-weight: 600; }

    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #64748b; }
    .spinner { width: 42px; height: 42px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 14px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .computers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .comp-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .comp-head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px; }
    .comp-head h4 { margin: 0 0 4px; font-size: 18px; color: #1e293b; }
    .comp-meta { font-size: 13px; color: #64748b; }
    .comp-meta code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
    .dept-tag { color: #64748b; font-size: 12px; margin-left: 4px; }
    .del-btn { background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; }

    .software-installed-list h5 { margin: 0 0 10px; font-size: 12px; color: #64748b; text-transform: uppercase; }
    .inst-item { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; font-size: 13px; }
    .inst-info { display: flex; flex-direction: column; gap: 2px; }
    .inst-name { font-weight: bold; color: #0f172a; }
    .inst-ver { font-size: 11px; color: #64748b; }
    .key-code { font-size: 11px; color: #475569; font-family: monospace; }
    .inst-status { display: flex; align-items: center; gap: 8px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge.active { background: #dcfce7; color: #15803d; }
    .badge.warning { background: #fef9c3; color: #a16207; }
    .badge.danger { background: #fee2e2; color: #b91c1c; }
    .remove-sw-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
    .edit-sw-btn { background: none; border: none; font-size: 13px; cursor: pointer; padding: 2px 4px; border-radius: 4px; }
    .edit-sw-btn:hover { background: #e2e8f0; }
    .remove-sw-btn:hover { color: #ef4444; }
    .empty-inst { color: #94a3b8; font-size: 13px; font-style: italic; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 0; color: #64748b; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; padding: 24px; border-radius: 12px; width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .modal h3 { margin: 0 0 16px; font-size: 18px; color: #0f172a; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #475569; }
    .form-group input, .form-group select { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  `]
})
export class ComputersComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSaving = false;

  departments: Department[] = [];
  computers: Computer[] = [];
  employees: Employee[] = [];
  catalog: CatalogSoftware[] = [];
  installed: InstalledSoftware[] = [];

  // Фильтры и поиск
  searchQuery = '';
  selectedDeptFilter = 'ALL';
  selectedStatusFilter = 'ALL';

  showCompModal = false;
  showInstallModal = false;
  showEditInstallModal = false; // <-- ДОБАВИЛИ
  editingInstall: InstalledSoftware | null = null; // <-- ДОБАВИЛИ

  newComp = { name: '', ip: '', employeeId: '' };
  newInstall = { computerId: '', softwareCatalogId: '', version: '', licenseKey: '', expiryDate: '' };

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.api.getAllData().subscribe({
      next: data => {
        this.departments = data.departments;
        this.computers = data.computers;
        this.employees = data.employees;
        this.catalog = data.catalog;
        this.installed = data.installed;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- ЛОГИКА ФИЛЬТРАЦИИ И ПОИСКА ---
  get filteredComputers(): Computer[] {
    return this.computers.filter(comp => {
      const emp = this.getEmployee(comp.employeeId);
      const deptId = emp ? emp.departmentId : '';
      const compInstalled = this.getInstalledForComp(comp.id);

      // 1. Фильтр по отделу
      if (this.selectedDeptFilter !== 'ALL' && deptId !== this.selectedDeptFilter) {
        return false;
      }

      // 2. Фильтр по статусу лицензий
      if (this.selectedStatusFilter === 'PROBLEMS') {
        const hasProblem = compInstalled.some(inst => {
          const st = this.calcStatus(inst.expiryDate).status;
          return st === 'warning' || st === 'danger';
        });
        if (!hasProblem) return false;
      } else if (this.selectedStatusFilter === 'ACTIVE') {
        const allActive = compInstalled.length > 0 && compInstalled.every(inst => {
          return this.calcStatus(inst.expiryDate).status === 'active';
        });
        if (!allActive) return false;
      }

      // 3. Текстовый поиск
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchName = comp.name.toLowerCase().includes(q);
        const matchIp = comp.ip.toLowerCase().includes(q);
        const matchEmp = emp ? emp.name.toLowerCase().includes(q) : false;
        const matchSw = compInstalled.some(inst => {
          const swName = this.getSoftwareName(inst.softwareCatalogId).toLowerCase();
          return swName.includes(q);
        });

        return matchName || matchIp || matchEmp || matchSw;
      }

      return true;
    });
  }

  get problemCount(): number {
    return this.computers.filter(comp => {
      const compInstalled = this.getInstalledForComp(comp.id);
      return compInstalled.some(inst => {
        const st = this.calcStatus(inst.expiryDate).status;
        return st === 'warning' || st === 'danger';
      });
    }).length;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedDeptFilter = 'ALL';
    this.selectedStatusFilter = 'ALL';
  }

  calcStatus(expiry: string) {
    return calculateLicenseStatus(expiry);
  }

  getEmployee(empId: string): Employee | undefined {
    return this.employees.find(e => e.id === empId);
  }

  getEmployeeName(empId: string): string {
    return this.getEmployee(empId)?.name || 'Не назначен';
  }

  getDepartmentName(empId: string): string {
    const emp = this.getEmployee(empId);
    if (!emp) return 'Не указан';
    return this.departments.find(d => d.id === emp.departmentId)?.name || 'Не указан';
  }

  getDeptNameById(deptId: string): string {
    return this.departments.find(d => d.id === deptId)?.name || '';
  }

  getSoftwareName(catId: string): string {
    return this.catalog.find(c => c.id === catId)?.name || 'ПО';
  }

  getInstalledForComp(compId: string): InstalledSoftware[] {
    return this.installed.filter(i => i.computerId === compId);
  }

  onSaveComputer() {
    if (!this.newComp.name || !this.newComp.employeeId) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    this.api.addComputer(this.newComp.name, this.newComp.ip, this.newComp.employeeId).subscribe({
      next: () => {
        this.showCompModal = false;
        this.isSaving = false;
        this.newComp = { name: '', ip: '', employeeId: '' };
        this.load();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteComp(id: string) {
    if (confirm('Удалить компьютер?')) {
      this.api.deleteComputer(id).subscribe(() => this.load());
    }
  }

  onSaveInstall() {
    if (!this.newInstall.computerId || !this.newInstall.softwareCatalogId) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    this.api.installSoftware(this.newInstall).subscribe({
      next: () => {
        this.showInstallModal = false;
        this.isSaving = false;
        this.newInstall = { computerId: '', softwareCatalogId: '', version: '', licenseKey: '', expiryDate: '' };
        this.load();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteInstall(id: string) {
    this.api.deleteInstalledSoftware(id).subscribe(() => this.load());
  }

  openEditInstall(inst: InstalledSoftware) {
    this.editingInstall = { ...inst }; // Копируем данные для редактирования
    this.showEditInstallModal = true;
  }

  onUpdateInstall() {
    if (!this.editingInstall) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    this.api.updateInstalledSoftware(this.editingInstall.id, {
      version: this.editingInstall.version,
      licenseKey: this.editingInstall.licenseKey,
      expiryDate: this.editingInstall.expiryDate
    }).subscribe({
      next: () => {
        this.showEditInstallModal = false;
        this.editingInstall = null;
        this.isSaving = false;
        this.load(); // Перезагружаем список (статус лицензии пересчитается автоматически!)
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}