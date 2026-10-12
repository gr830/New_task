import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Department, Employee, CatalogSoftware, Computer, InstalledSoftware, SoftwareLink, NetworkDashboard, NetworkDevice, NetworkLink } from './models';

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

  // --- УСТАНОВКА ПО ---
  installSoftware(data: Omit<InstalledSoftware, 'id'>): Observable<InstalledSoftware> {
    return this.http.post<InstalledSoftware>(`${this.baseUrl}/installed_software`, { ...data, id: this.genId('inst') });
  }
  updateInstalledSoftware(id: string, data: Partial<InstalledSoftware>): Observable<InstalledSoftware> {
    return this.http.patch<InstalledSoftware>(`${this.baseUrl}/installed_software/${id}`, data);
  }
  deleteInstalledSoftware(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/installed_software/${id}`);
  }

  // --- СВЯЗИ ---
  addLink(data: Omit<SoftwareLink, 'id'>): Observable<SoftwareLink> {
    return this.http.post<SoftwareLink>(`${this.baseUrl}/links`, { ...data, id: this.genId('link') });
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

  // --- NMS: СЕТЕВЫЕ ДАШБОРДЫ ---
  getNetworkDashboards(): Observable<NetworkDashboard[]> {
    return this.http.get<NetworkDashboard[]>(`${this.baseUrl}/network_dashboards`);
  }
  addNetworkDashboard(data: Partial<NetworkDashboard>): Observable<NetworkDashboard> {
    return this.http.post<NetworkDashboard>(`${this.baseUrl}/network_dashboards`, { ...data, id: this.genId('ndash') });
  }
  updateNetworkDashboard(id: string, data: Partial<NetworkDashboard>): Observable<NetworkDashboard> {
    return this.http.patch<NetworkDashboard>(`${this.baseUrl}/network_dashboards/${id}`, data);
  }
  deleteNetworkDashboard(id: string): Observable<void> { // <-- НОВЫЙ МЕТОД
    return this.http.delete<void>(`${this.baseUrl}/network_dashboards/${id}`);
  }

  // --- NMS: СЕТЕВЫЕ УСТРОЙСТВА ---
  getNetworkDevices(): Observable<NetworkDevice[]> {
    return this.http.get<NetworkDevice[]>(`${this.baseUrl}/network_devices`);
  }
  addNetworkDevice(data: Partial<NetworkDevice>): Observable<NetworkDevice> {
    return this.http.post<NetworkDevice>(`${this.baseUrl}/network_devices`, { ...data, id: this.genId('ndev'), status: 'online' });
  }
  updateNetworkDevice(id: string, data: Partial<NetworkDevice>): Observable<NetworkDevice> {
    return this.http.patch<NetworkDevice>(`${this.baseUrl}/network_devices/${id}`, data);
  }
  deleteNetworkDevice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/network_devices/${id}`);
  }

  // --- NMS: СЕТЕВЫЕ СВЯЗИ ---
  getNetworkLinks(): Observable<NetworkLink[]> {
    return this.http.get<NetworkLink[]>(`${this.baseUrl}/network_links`);
  }
  addNetworkLinks(links: Partial<NetworkLink>[]): Observable<NetworkLink[]> {
    const creates = links.map(l => this.http.post<NetworkLink>(`${this.baseUrl}/network_links`, { ...l, id: this.genId('nlink') }));
    return forkJoin(creates);
  }
  updateNetworkLink(id: string, data: Partial<NetworkLink>): Observable<NetworkLink> { // <-- НОВЫЙ МЕТОД
    return this.http.patch<NetworkLink>(`${this.baseUrl}/network_links/${id}`, data);
  }
  deleteNetworkLink(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/network_links/${id}`);
  }
}