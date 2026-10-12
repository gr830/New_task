export interface Department { id: string; name: string; }
export interface Employee { id: string; name: string; departmentId: string; }
export interface CatalogSoftware { id: string; name: string; }
export interface Computer { id: string; name: string; ip: string; employeeId: string; }
export interface InstalledSoftware { id: string; computerId: string; softwareCatalogId: string; version: string; licenseKey: string; expiryDate: string; }
export interface SoftwareLink { id: string; fromInstalledId: string; toInstalledId: string; type: string; description: string; }

export function calculateLicenseStatus(expiryDate: string): { status: 'active' | 'warning' | 'danger'; label: string; daysLeft: number; } {
  if (!expiryDate) return { status: 'active', label: 'Бессрочно', daysLeft: 9999 };
  const diffDays = Math.ceil((new Date(expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays < 0) return { status: 'danger', label: `Просрочено на ${Math.abs(diffDays)} дн.!`, daysLeft: diffDays };
  if (diffDays <= 30) return { status: 'warning', label: `Истекает через ${diffDays} дн.`, daysLeft: diffDays };
  return { status: 'active', label: `Активно (${diffDays} дн.)`, daysLeft: diffDays };
}

// --- СЕТЕВАЯ ТОПОЛОГИЯ ---
export interface DashboardImage {
  id: string;
  name?: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  locked: boolean;
}

export interface NetworkDashboard {
  id: string;
  name: string;
  bgImage?: string;
  images?: DashboardImage[];
}

export type NetworkDeviceType = 'Микротик' | 'Свитч' | 'Сервер' | 'Вайфай' | 'Принтер' | 'Компьютер' | 'Тонкий клиент' | 'Ноутбук' | 'Телефон' | 'Станок ЧПУ' | 'Камера' | 'Другой';

export interface NetworkDevice {
  id: string;
  dashboardId: string;
  name: string;
  type: NetworkDeviceType;
  customIcon?: string;
  ip: string;
  pollingMethod: 'ICMP_PING' | 'SNMP' | 'TCP_PORT' | 'HTTP_API';
  status: 'online' | 'offline' | 'warning';
  x?: number;
  y?: number;
  locked?: boolean;
  attachedImageId?: string; // ID прикрепленной картинки
}

export interface NetworkLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  description?: string; 
}