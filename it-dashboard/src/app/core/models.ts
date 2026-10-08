export interface Department {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  departmentId: string;
}

export interface CatalogSoftware {
  id: string;
  name: string;
}

export interface Computer {
  id: string;
  name: string;
  ip: string;
  employeeId: string;
}

export interface InstalledSoftware {
  id: string;
  computerId: string;
  softwareCatalogId: string;
  version: string;
  licenseKey: string;
  expiryDate: string; // Формат ГГГГ-ММ-ДД
}

export interface SoftwareLink {
  id: string;
  fromInstalledId: string;
  toInstalledId: string;
  type: string;
  description: string;
}

// Автоматический расчет статуса лицензии от текущей даты
export function calculateLicenseStatus(expiryDate: string): {
  status: 'active' | 'warning' | 'danger';
  label: string;
  daysLeft: number;
} {
  if (!expiryDate) {
    return { status: 'active', label: 'Бессрочно', daysLeft: 9999 };
  }

  const target = new Date(expiryDate).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'danger', label: `Просрочено на ${Math.abs(diffDays)} дн.!`, daysLeft: diffDays };
  } else if (diffDays <= 30) {
    return { status: 'warning', label: `Истекает через ${diffDays} дн.`, daysLeft: diffDays };
  } else {
    return { status: 'active', label: `Активно (${diffDays} дн.)`, daysLeft: diffDays };
  }
}