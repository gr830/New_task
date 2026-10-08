import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Department, Employee, CatalogSoftware } from '../../core/models';

type TabType = 'departments' | 'employees' | 'software';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="catalogs-page">
      <div class="page-header">
        <div>
          <h2>📚 Базовые справочники предприятия</h2>
          <p class="subtitle">Управление справочниками отделов, сотрудников и перечнем программного обеспечения</p>
        </div>
      </div>

      <!-- ВКЛАДКИ (ТАБЫ) -->
      <div class="tabs-nav">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'departments'" 
          (click)="activeTab = 'departments'; searchQuery = ''"
        >
          🏢 Отделы <span class="badge-count">{{ departments.length }}</span>
        </button>

        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'employees'" 
          (click)="activeTab = 'employees'; searchQuery = ''"
        >
          👤 Сотрудники <span class="badge-count">{{ employees.length }}</span>
        </button>

        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'software'" 
          (click)="activeTab = 'software'; searchQuery = ''"
        >
          📦 Каталог ПО <span class="badge-count">{{ catalog.length }}</span>
        </button>
      </div>

      <!-- КРУТИЛКА ЗАГРУЗКИ -->
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка справочников...</p>
        </div>
      } @else {
        <div class="tab-content-card">
          <!-- 1. ВКЛАДКА: ОТДЕЛЫ -->
          @if (activeTab === 'departments') {
            <div class="section-top">
              <div class="add-form-inline">
                <input [(ngModel)]="newDeptName" placeholder="Название нового отдела..." />
                <button class="btn blue" (click)="onAddDept()" [disabled]="!newDeptName.trim()">+ Добавить отдел</button>
              </div>
              <div class="search-box">
                <input [(ngModel)]="searchQuery" placeholder="🔍 Поиск по отделам..." />
              </div>
            </div>

            <div class="items-table-wrap">
              <table class="simple-table">
                <thead>
                  <tr>
                    <th>Название отдела</th>
                    <th>Сотрудников в отделе</th>
                    <th style="width: 80px; text-align: center;">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  @for (d of filteredDepartments; track d.id) {
                    <tr>
                      <td><strong>{{ d.name }}</strong></td>
                      <td>
                        <span class="count-tag">{{ getEmployeesCountInDept(d.id) }} чел.</span>
                      </td>
                      <td style="text-align: center;">
                        <button class="del-icon-btn" (click)="onDeleteDept(d.id, d.name)" title="Удалить отдел">🗑️</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="3" class="empty-row">Отделы не найдены</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- 2. ВКЛАДКА: СОТРУДНИКИ -->
          @if (activeTab === 'employees') {
            <div class="section-top">
              <div class="add-form-inline">
                <input [(ngModel)]="newEmpName" placeholder="ФИО сотрудника..." style="min-width: 260px;" />
                <select [(ngModel)]="newEmpDeptId">
                  <option value="" disabled selected>Выберите отдел...</option>
                  @for (d of departments; track d.id) {
                    <option [value]="d.id">{{ d.name }}</option>
                  }
                </select>
                <button class="btn blue" (click)="onAddEmp()" [disabled]="!newEmpName.trim() || !newEmpDeptId">+ Добавить сотрудника</button>
              </div>
              <div class="search-box">
                <input [(ngModel)]="searchQuery" placeholder="🔍 Поиск по ФИО или отделу..." />
              </div>
            </div>

            <div class="items-table-wrap">
              <table class="simple-table">
                <thead>
                  <tr>
                    <th>ФИО Сотрудника</th>
                    <th>Отдел</th>
                    <th style="width: 80px; text-align: center;">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of filteredEmployees; track e.id) {
                    <tr>
                      <td><strong>{{ e.name }}</strong></td>
                      <td><span class="dept-badge">{{ getDeptName(e.departmentId) }}</span></td>
                      <td style="text-align: center;">
                        <button class="del-icon-btn" (click)="onDeleteEmp(e.id, e.name)" title="Удалить сотрудника">🗑️</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="3" class="empty-row">Сотрудники не найдены</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- 3. ВКЛАДКА: КАТАЛОГ ПО -->
          @if (activeTab === 'software') {
            <div class="section-top">
              <div class="add-form-inline">
                <input [(ngModel)]="newSwName" placeholder="Название ПО (например: AutoCAD, 1С, Docker)..." style="min-width: 320px;" />
                <button class="btn blue" (click)="onAddSw()" [disabled]="!newSwName.trim()">+ Добавить в каталог</button>
              </div>
              <div class="search-box">
                <input [(ngModel)]="searchQuery" placeholder="🔍 Поиск по каталогу ПО..." />
              </div>
            </div>

            <div class="items-table-wrap">
              <table class="simple-table">
                <thead>
                  <tr>
                    <th>Наименование программного обеспечения</th>
                    <th style="width: 80px; text-align: center;">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of filteredCatalog; track c.id) {
                    <tr>
                      <td><strong>{{ c.name }}</strong></td>
                      <td style="text-align: center;">
                        <button class="del-icon-btn" (click)="onDeleteSw(c.id, c.name)" title="Удалить из каталога">🗑️</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="2" class="empty-row">Программы не найдены</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .catalogs-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 20px; }
    h2 { margin: 0 0 4px; font-size: 22px; color: #1e293b; }
    .subtitle { margin: 0; font-size: 14px; color: #64748b; }

    /* ВКЛАДКИ */
    .tabs-nav { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; }
    .tab-btn {
      background: none; border: none; padding: 12px 20px; font-size: 14px; font-weight: 600;
      color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 8px;
      border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.2s;
    }
    .tab-btn:hover { color: #0f172a; }
    .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: bold; }
    .badge-count { background: #f1f5f9; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .tab-btn.active .badge-count { background: #eff6ff; color: #2563eb; }

    .tab-content-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

    .section-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .add-form-inline { display: flex; gap: 10px; flex-wrap: wrap; }
    .add-form-inline input, .add-form-inline select { padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
    .btn { padding: 9px 18px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; transition: all 0.2s; font-size: 13px; white-space: nowrap; }
    .btn.blue { background: #2563eb; color: white; }
    .btn.blue:hover { background: #1d4ed8; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .search-box input { padding: 9px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 260px; }

    /* ТАБЛИЦЫ */
    .items-table-wrap { overflow-x: auto; }
    .simple-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
    .simple-table th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .simple-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .count-tag { background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 12px; color: #475569; }
    .dept-badge { background: #eff6ff; color: #1e40af; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .del-icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
    .del-icon-btn:hover { background: #fee2e2; }
    .empty-row { text-align: center; color: #94a3b8; padding: 40px !important; }

    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #64748b; }
    .spinner { width: 42px; height: 42px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 14px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class CatalogsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  activeTab: TabType = 'departments';

  departments: Department[] = [];
  employees: Employee[] = [];
  catalog: CatalogSoftware[] = [];

  searchQuery = '';

  newDeptName = '';
  newEmpName = '';
  newEmpDeptId = '';
  newSwName = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.api.getAllData().subscribe({
      next: data => {
        this.departments = data.departments;
        this.employees = data.employees;
        this.catalog = data.catalog;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredDepartments(): Department[] {
    if (!this.searchQuery.trim()) return this.departments;
    const q = this.searchQuery.toLowerCase().trim();
    return this.departments.filter(d => d.name.toLowerCase().includes(q));
  }

  get filteredEmployees(): Employee[] {
    if (!this.searchQuery.trim()) return this.employees;
    const q = this.searchQuery.toLowerCase().trim();
    return this.employees.filter(e => {
      const matchName = e.name.toLowerCase().includes(q);
      const matchDept = this.getDeptName(e.departmentId).toLowerCase().includes(q);
      return matchName || matchDept;
    });
  }

  get filteredCatalog(): CatalogSoftware[] {
    if (!this.searchQuery.trim()) return this.catalog;
    const q = this.searchQuery.toLowerCase().trim();
    return this.catalog.filter(c => c.name.toLowerCase().includes(q));
  }

  getDeptName(deptId: string): string {
    return this.departments.find(d => d.id === deptId)?.name || 'Не указан';
  }

  getEmployeesCountInDept(deptId: string): number {
    return this.employees.filter(e => e.departmentId === deptId).length;
  }

  onAddDept() {
    if (!this.newDeptName.trim()) return;
    this.api.addDepartment(this.newDeptName.trim()).subscribe(() => {
      this.newDeptName = '';
      this.load();
    });
  }

  onDeleteDept(id: string, name: string) {
    if (confirm(`Удалить отдел "${name}"?`)) {
      this.api.deleteDepartment(id).subscribe(() => this.load());
    }
  }

  onAddEmp() {
    if (!this.newEmpName.trim() || !this.newEmpDeptId) return;
    this.api.addEmployee(this.newEmpName.trim(), this.newEmpDeptId).subscribe(() => {
      this.newEmpName = '';
      this.newEmpDeptId = '';
      this.load();
    });
  }

  onDeleteEmp(id: string, name: string) {
    if (confirm(`Удалить сотрудника "${name}"?`)) {
      this.api.deleteEmployee(id).subscribe(() => this.load());
    }
  }

  onAddSw() {
    if (!this.newSwName.trim()) return;
    this.api.addCatalogSoftware(this.newSwName.trim()).subscribe(() => {
      this.newSwName = '';
      this.load();
    });
  }

  onDeleteSw(id: string, name: string) {
    if (confirm(`Удалить программу "${name}" из каталога?`)) {
      this.api.deleteCatalogSoftware(id).subscribe(() => this.load());
    }
  }
}