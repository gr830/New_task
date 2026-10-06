import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://meridian-sap-api.grosver.com/api/raw-query/exec';

  constructor(private http: HttpClient) {}

  getGanttData(): Observable<any> {
    const payload = { 
      query: "EXEC dbo.GetGanttMachineSchedule" 
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(this.apiUrl, payload, { headers }).pipe(
      map(response => {
        const rows = response.data || [];
        return this.transformToGanttFormat(rows);
      })
    );
  }

  private transformToGanttFormat(sqlData: any[]) {
    const ganttData: any[] = [];
    const machines = new Set<string>();

    (sqlData || []).forEach((row, index) => {
      const machineId = (row.APLATZ_ID || '').toString().trim();
      if (!machineId) return;

      if (!machines.has(machineId)) {
        machines.add(machineId);
        ganttData.push({
          id: machineId,
          text: `Станок: ${machineId}`,
          open: true,
          type: 'project',
          machine_id: machineId
        });
      }

      const plan = parseFloat(row.PLAN_MENGE) || 1;
      const fact = parseFloat(row.FACT_MENGE_GUT) || 0;
      const rawProgress = fact / plan;
      const progress = rawProgress > 1 ? 1 : (rawProgress < 0 ? 0 : rawProgress);

      const startDate = this.formatDate(row.GESAMT_ANFZEIT);
      const endDate = this.formatDate(row.GESAMT_ENDZEIT);

      const itemCode = (row.ItemCode || '').toString().trim();
      const itemName = (row.ItemName || '').toString().trim();
      const auftrag = (row.AUFTRAG || '').toString().trim();
      const posId = (row.POS_ID || '').toString().trim();

      const taskTitle = `[${auftrag}] ${itemCode} — ${itemName} (Оп. ${posId})`;

      ganttData.push({
        id: `task_${row.BELNR_ID}_${row.POS_ID}_${index}`,
        text: taskTitle,
        start_date: startDate,
        end_date: endDate,
        parent: machineId,
        progress: progress,
        plan_qty: plan,
        fact_qty: fact,
        auftrag: auftrag,
        item_code: itemCode,
        item_name: itemName,
        pos_text: row.POS_TEXT,
        machine_id: machineId // Связываем задачу со станком
      });
    });

    return { data: ganttData, links: [] };
  }

  private formatDate(sqlDate: string): string {
    if (!sqlDate) return '';
    const match = sqlDate.toString().match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]}`;
    }
    return sqlDate;
  }
}