export interface SystemSettings {
  mainAcharyaName: string;
  mainAcharyaPhone: string;
  adminPhone: string;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  mainAcharyaName: 'Vedamurthy Sri Narayan Bhat',
  mainAcharyaPhone: '919902045009',
  adminPhone: '919902045009'
};

const SETTINGS_KEY = 'mantrakshata_system_settings';

export function getSystemSettings(): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        mainAcharyaName: parsed.mainAcharyaName || DEFAULT_SYSTEM_SETTINGS.mainAcharyaName,
        mainAcharyaPhone: parsed.mainAcharyaPhone || DEFAULT_SYSTEM_SETTINGS.mainAcharyaPhone,
        adminPhone: parsed.adminPhone || DEFAULT_SYSTEM_SETTINGS.adminPhone
      };
    }
  } catch {}
  return DEFAULT_SYSTEM_SETTINGS;
}

export function saveLocalSystemSettings(settings: SystemSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export async function fetchSystemSettings(): Promise<SystemSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.settings) {
        saveLocalSystemSettings(data.settings);
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('Could not fetch settings from server:', err);
  }
  return getSystemSettings();
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = getSystemSettings();
  const rawMainPhone = (settings.mainAcharyaPhone || current.mainAcharyaPhone).replace(/\D/g, '');
  const rawAdminPhone = (settings.adminPhone || current.adminPhone).replace(/\D/g, '');

  const updated: SystemSettings = {
    mainAcharyaName: (settings.mainAcharyaName || current.mainAcharyaName).trim(),
    mainAcharyaPhone: rawMainPhone.length === 10 ? '91' + rawMainPhone : rawMainPhone,
    adminPhone: rawAdminPhone.length === 10 ? '91' + rawAdminPhone : rawAdminPhone
  };

  saveLocalSystemSettings(updated);

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.settings) {
        saveLocalSystemSettings(data.settings);
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('Could not persist settings to server:', err);
  }

  return updated;
}
