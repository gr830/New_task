import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { gantt } from 'dhtmlx-gantt';

interface MachineFilterItem {
  id: string;
  name: string;
  selected: boolean;
}

interface PartFilterItem {
  code: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-gantt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './gantt.html',
  styleUrls: ['./gantt.css'],
  encapsulation: ViewEncapsulation.None
})
export class GanttComponent implements OnInit {
  @ViewChild('ganttContainer', { static: true }) ganttContainer!: ElementRef;

  isLoading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  private toastTimeout: any;

  filterFrom: string = '';
  filterTo: string = '';

  isCompactView: boolean = false;
  isGridVisible: boolean = true;

  private rawTasks: any[] = [];

  isMachinesDropdownOpen: boolean = false;
  allMachinesList: MachineFilterItem[] = [];
  visibleMachinesList: MachineFilterItem[] = [];
  machineSearchQuery: string = '';

  isPartsDropdownOpen: boolean = false;
  allPartsList: PartFilterItem[] = [];
  visiblePartsList: PartFilterItem[] = [];
  partSearchQuery: string = '';
  private deselectedPartCodes = new Set<string>();

  constructor(
    private apiService: ApiService, 
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initGantt();
    this.loadData();
  }

  get totalMachinesCount(): number {
    return this.allMachinesList.length;
  }

  get selectedMachinesCount(): number {
    return this.allMachinesList.filter(m => m.selected).length;
  }

  get totalPartsCount(): number {
    return this.allPartsList.length;
  }

  get selectedPartsCount(): number {
    return this.allPartsList.filter(p => p.selected).length;
  }

  private formatDateDisplay(date: Date): string {
    if (!date) return '';
    const d = ('0' + date.getDate()).slice(-2);
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const h = ('0' + date.getHours()).slice(-2);
    const min = ('0' + date.getMinutes()).slice(-2);
    return `${d}.${m} ${h}:${min}`;
  }

  private triggerToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.cdr.detectChanges();

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  updateColumns() {
    if (this.isCompactView) {
      gantt.config.columns = [
        { 
          name: "text", 
          label: "№ Детали", 
          tree: true, 
          width: 170, 
          resize: true,
          template: (task: any) => {
            if (task.type === 'project') return task.text;
            return task.item_code || task.text;
          }
        }
      ];
    } else {
      gantt.config.columns = [
        { name: "text", label: "Заказ / Номер детали", tree: true, width: 340, resize: true },
        { 
          name: "start_date", 
          label: "Начало", 
          align: "center", 
          width: 110,
          template: (task: any) => this.formatDateDisplay(task.start_date)
        },
        { 
          name: "progress", 
          label: "Готово", 
          align: "center", 
          width: 70, 
          template: (task: any) => {
            return task.type === 'project' ? '' : Math.round((task.progress || 0) * 100) + "%";
          }
        }
      ];
    }
  }

  initGantt() {
    (gantt as any).plugins({
      tooltip: true,
      marker: true
    });

    this.updateColumns();

    const doesFitInside = (start: Date, end: Date, text: string): boolean => {
      if (!start || !end || !text) return false;
      try {
        const startPos = gantt.posFromDate(start);
        const endPos = gantt.posFromDate(end);
        const barWidthPx = endPos - startPos;
        const requiredWidthPx = (text.length * 7.5) + 25;
        return barWidthPx >= requiredWidthPx;
      } catch {
        return false;
      }
    };

    (gantt.templates as any).task_text = (start: Date, end: Date, task: any) => {
      if (task.type === 'project') return task.text;
      return doesFitInside(start, end, task.text) ? task.text : '';
    };

    (gantt.templates as any).rightside_text = (start: Date, end: Date, task: any) => {
      if (task.type === 'project') return '';
      return doesFitInside(start, end, task.text) ? '' : task.text;
    };

    (gantt.templates as any).tooltip_text = (start: Date, end: Date, task: any) => {
      if (task.type === 'project') {
        return `<b>${task.text}</b>`;
      }
      return `
        <b>Заказ:</b> ${task.auftrag || ''}<br/>
        <b>Номер детали (Артикул):</b> <b><span style="color:#2ecc71;">${task.item_code || ''}</span></b><br/>
        <b>Наименование:</b> ${task.item_name || ''}<br/>
        <b>Операция:</b> ${task.pos_text || task.text}<br/>
        <b>Период:</b> ${this.formatDateDisplay(start)} — ${this.formatDateDisplay(end)}<br/>
        <b>План / Факт:</b> ${task.plan_qty} шт. / ${task.fact_qty} шт. (${Math.round((task.progress || 0) * 100)}%)
      `;
    };

    // ФИЛЬТРАЦИЯ
    gantt.attachEvent("onBeforeTaskDisplay", (id: string, task: any) => {
      const fromTime = this.filterFrom ? new Date(this.filterFrom + 'T00:00:00').getTime() : -Infinity;
      const toTime = this.filterTo ? new Date(this.filterTo + 'T23:59:59').getTime() : Infinity;

      const activeMachineIds = new Set(this.allMachinesList.filter(m => m.selected).map(m => m.id));
      const activePartCodes = new Set(this.allPartsList.filter(p => p.selected).map(p => p.code));

      const isTaskAllowed = (t: any): boolean => {
        if (!t || !t.start_date || !t.end_date) return false;

        const dateMatch = t.end_date.getTime() >= fromTime && t.start_date.getTime() <= toTime;
        if (!dateMatch) return false;

        // Если список станков уже инициализирован, проверяем
        const machineId = t.machine_id || t.parent;
        if (this.allMachinesList.length > 0 && !activeMachineIds.has(machineId)) return false;

        // Если список деталей инициализирован, проверяем
        if (this.allPartsList.length > 0 && t.item_code && !activePartCodes.has(t.item_code)) return false;

        return true;
      };

      if (task.type === 'project') {
        if (this.allMachinesList.length > 0 && !activeMachineIds.has(task.id)) return false;

        const children = gantt.getChildren(id);
        return children.some((childId: string) => {
          const child = gantt.getTask(childId);
          return isTaskAllowed(child);
        });
      }

      return isTaskAllowed(task);
    });

    const zoomConfig: any = {
      levels: [
        {
          name: "hours",
          scale_height: 50,
          scales: [
            { unit: "day", step: 1, format: "%d %M, %D" },
            { unit: "hour", step: 2, format: "%H:00" }
          ]
        },
        {
          name: "days",
          scale_height: 50,
          scales: [
            { unit: "month", step: 1, format: "%F %Y" },
            { unit: "day", step: 1, format: "%d %M" }
          ]
        },
        {
          name: "weeks",
          scale_height: 50,
          scales: [
            { unit: "month", step: 1, format: "%F %Y" },
            { unit: "week", step: 1, format: "Нед #%W" }
          ]
        },
        {
          name: "months",
          scale_height: 50,
          scales: [
            { unit: "year", step: 1, format: "%Y" },
            { unit: "month", step: 1, format: "%F" }
          ]
        }
      ]
    };

    (gantt.ext as any).zoom.init(zoomConfig);
    (gantt.ext as any).zoom.setLevel("days");

    gantt.attachEvent("onTaskClick", (id: string) => {
      const task = gantt.getTask(id);
      if (task && task.start_date) {
        gantt.showDate(task.start_date);
      }
      return true;
    });

    (gantt.config as any)['readonly'] = true;
    (gantt.config as any)['grid_resize'] = true;
    (gantt.config as any)['show_progress'] = true;
    (gantt.config as any)['scroll_size'] = 14;

    gantt.init(this.ganttContainer.nativeElement);
  }

  onMachineChange() {
    this.updateAvailableParts();
    gantt.render();
  }

  selectAllMachines(select: boolean) {
    this.allMachinesList.forEach(m => m.selected = select);
    this.updateAvailableParts();
    gantt.render();
  }

  private updateAvailableParts() {
    const activeMachineIds = new Set(this.allMachinesList.filter(m => m.selected).map(m => m.id));
    const availablePartsMap = new Map<string, string>();

    this.rawTasks.forEach(t => {
      const mId = t.machine_id || t.parent;
      if (mId && activeMachineIds.has(mId) && t.item_code) {
        availablePartsMap.set(t.item_code, t.item_name || '');
      }
    });

    this.allPartsList = Array.from(availablePartsMap.entries()).map(([code, name]) => ({
      code,
      name,
      selected: !this.deselectedPartCodes.has(code)
    })).sort((a, b) => a.code.localeCompare(b.code));

    this.filterPartsList();
  }

  onPartSelectionChange() {
    this.allPartsList.forEach(p => {
      if (!p.selected) {
        this.deselectedPartCodes.add(p.code);
      } else {
        this.deselectedPartCodes.delete(p.code);
      }
    });
    gantt.render();
  }

  selectAllParts(select: boolean) {
    this.allPartsList.forEach(p => {
      p.selected = select;
      if (!select) {
        this.deselectedPartCodes.add(p.code);
      } else {
        this.deselectedPartCodes.delete(p.code);
      }
    });
    gantt.render();
  }

  toggleMachinesDropdown() {
    this.isMachinesDropdownOpen = !this.isMachinesDropdownOpen;
    if (this.isMachinesDropdownOpen) this.isPartsDropdownOpen = false;
  }

  filterMachinesList() {
    const q = (this.machineSearchQuery || '').toLowerCase().trim();
    if (!q) {
      this.visibleMachinesList = [...this.allMachinesList];
    } else {
      this.visibleMachinesList = this.allMachinesList.filter(m => 
        m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
    }
  }

  togglePartsDropdown() {
    this.isPartsDropdownOpen = !this.isPartsDropdownOpen;
    if (this.isPartsDropdownOpen) this.isMachinesDropdownOpen = false;
  }

  filterPartsList() {
    const q = (this.partSearchQuery || '').toLowerCase().trim();
    if (!q) {
      this.visiblePartsList = [...this.allPartsList];
    } else {
      this.visiblePartsList = this.allPartsList.filter(p => 
        p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
    }
  }

  private populateFilters(tasks: any[]) {
    this.rawTasks = tasks;
    const uniqueMachines = new Set<string>();

    tasks.forEach(t => {
      const mId = t.machine_id || t.parent;
      if (mId && t.type !== 'project') {
        uniqueMachines.add(mId);
      }
    });

    this.allMachinesList = Array.from(uniqueMachines).map(id => ({
      id,
      name: `Станок ${id}`,
      selected: true
    })).sort((a, b) => a.id.localeCompare(b.id));

    this.filterMachinesList();
    this.updateAvailableParts();
  }

  toggleCompactView() {
    this.isCompactView = !this.isCompactView;
    this.updateColumns();
    gantt.render();
  }

  toggleGrid() {
    this.isGridVisible = !this.isGridVisible;
    (gantt.config as any)['show_grid'] = this.isGridVisible;
    gantt.render();
  }

  scrollTimeline(direction: 'left' | 'right') {
    const scrollStep = 350;
    const currentX = (gantt as any).getScrollState().x;
    const newX = direction === 'left' ? currentX - scrollStep : currentX + scrollStep;
    (gantt as any).scrollTo(newX, null);
  }

  applyDateFilter() {
    if (this.filterFrom && this.filterTo) {
      const from = new Date(this.filterFrom + 'T00:00:00');
      const to = new Date(this.filterTo + 'T23:59:59');

      if (from > to) {
        alert('Дата «С» не может быть больше даты «По»');
        return;
      }

      gantt.config.start_date = gantt.date.add(from, -1, 'day');
      gantt.config.end_date = gantt.date.add(to, 1, 'day');
    } else {
      gantt.config.start_date = null as any;
      gantt.config.end_date = null as any;
    }
    gantt.render();
  }

  resetDateFilter() {
    this.filterFrom = '';
    this.filterTo = '';
    gantt.config.start_date = null as any;
    gantt.config.end_date = null as any;
    gantt.render();
  }

  setZoom(level: string) {
    (gantt.ext as any).zoom.setLevel(level);
    document.querySelectorAll('.zoom-controls button').forEach(b => b.classList.remove('active'));
    const btn = Array.from(document.querySelectorAll('.zoom-controls button')).find(b => b.textContent?.toLowerCase().includes(
      level === 'months' ? 'месяц' : level === 'weeks' ? 'недел' : level === 'days' ? 'дни' : 'час'
    ));
    btn?.classList.add('active');
  }

  zoomToFit() {
    document.querySelectorAll('.zoom-controls button').forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-fit')?.classList.add('active');
    
    const project = gantt.getSubtaskDates();
    if (project.start_date && project.end_date) {
      gantt.config.start_date = gantt.date.add(project.start_date, -2, 'day');
      gantt.config.end_date = gantt.date.add(project.end_date, 2, 'day');
      gantt.render();
    }
  }

  // =========================================================================
  // ИСПРАВЛЕННАЯ ЗАГРУЗКА ДАННЫХ
  // =========================================================================
  loadData() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.getGanttData().subscribe({
      next: (data) => {
        try {
          // 1. СНАЧАЛА заполняем фильтры (до parse, чтобы они не заблокировали задачи)
          this.populateFilters(data.data || []);

          // 2. Очищаем и парсим данные в Гант
          gantt.clearAll();
          gantt.parse(data);

          // 3. Применяем фильтр дат, если он был задан
          if (this.filterFrom || this.filterTo) {
            this.applyDateFilter();
          } else {
            gantt.render();
          }

          // 4. Автоматически перематываем график к первой дате заказов
          const projectDates = gantt.getSubtaskDates();
          if (projectDates.start_date) {
            gantt.showDate(projectDates.start_date);
          }
        } catch (e) {
          console.error('Ошибка отрисовки Ганта:', e);
        } finally {
          this.isLoading = false;
          this.triggerToast('✓ Диаграмма Ганта успешно сформирована!');
          this.cdr.detectChanges();

          // 5. Микро-пауза 50мс для идеальной перерисовки браузером
          setTimeout(() => {
            gantt.render();
          }, 50);
        }
      },
      error: (err) => {
        console.error('Ошибка загрузки Ганта', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        alert('Не удалось загрузить данные с сервера');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}