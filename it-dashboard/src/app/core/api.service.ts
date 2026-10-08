import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Department, Employee, CatalogSoftware, Computer, InstalledSoftware, SoftwareLink } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
  }

  getAllData(): Observable<{
    departments: Department[];
    employees: Employee[];
    catalog: CatalogSoftware[];
    computers: Computer[];
    installed: InstalledSoftware[];
    links: SoftwareLink[];
  }> {
    return forkJoin({
      departments: this.http.get<Department[]>(`${this.baseUrl}/departments`),
      employees: this.http.get<Employee[]>(`${this.baseUrl}/employees`),
      catalog: this.http.get<CatalogSoftware[]>(`${this.baseUrl}/software_catalog`),
      computers: this.http.get<Computer[]>(`${this.baseUrl}/computers`),
      installed: this.http.get<InstalledSoftware[]>(`${this.baseUrl}/installed_software`),
      links: this.http.get<SoftwareLink[]>(`${this.baseUrl}/links`)
    });
  }

  // --- СПРАВОЧНИКИ ---
  addDepartment(name: string): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments`, { id: this.genId('dep'), name });
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/departments/${id}`);
  }

  addEmployee(name: string, departmentId: string): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, { id: this.genId('emp'), name, departmentId });
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${id}`);
  }

  addCatalogSoftware(name: string): Observable<CatalogSoftware> {
    return this.http.post<CatalogSoftware>(`${this.baseUrl}/software_catalog`, { id: this.genId('cat'), name });
  }

  deleteCatalogSoftware(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/software_catalog/${id}`);
  }

  // --- КОМПЬЮТЕРЫ ---
  addComputer(name: string, ip: string, employeeId: string): Observable<Computer> {
    return this.http.post<Computer>(`${this.baseUrl}/computers`, { id: this.genId('comp'), name, ip, employeeId });
  }

  deleteComputer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/computers/${id}`);
  }

  installSoftware(data: Omit<InstalledSoftware, 'id'>): Observable<InstalledSoftware> {
    return this.http.post<InstalledSoftware>(`${this.baseUrl}/installed_software`, {
      ...data,
      id: this.genId('inst')
    });
  }

  // ДОБАВИЛИ РЕДАКТИРОВАНИЕ ПО (КЛЮЧ, ВЕРСИЯ, СРОК):
  updateInstalledSoftware(id: string, data: Partial<InstalledSoftware>): Observable<InstalledSoftware> {
    return this.http.patch<InstalledSoftware>(`${this.baseUrl}/installed_software/${id}`, data);
  }

  deleteInstalledSoftware(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/installed_software/${id}`);
  }

  // --- СВЯЗИ ---
  addLink(data: Omit<SoftwareLink, 'id'>): Observable<SoftwareLink> {
    return this.http.post<SoftwareLink>(`${this.baseUrl}/links`, {
      ...data,
      id: this.genId('link')
    });
  }

  addMultipleLinks(linksData: Omit<SoftwareLink, 'id'>[]): Observable<SoftwareLink[]> {
    return forkJoin(linksData.map(l => this.addLink(l)));
  }

  updateLink(id: string, data: Partial<SoftwareLink>): Observable<SoftwareLink> {
    return this.http.patch<SoftwareLink>(`${this.baseUrl}/links/${id}`, data);
  }

  deleteLink(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/links/${id}`);
  }
}