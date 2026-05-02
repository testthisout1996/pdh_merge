import * as React from "react";

export interface SiteSettings {
  idleTimeoutSeconds: number;
  disabledFeatures: string[];
}

interface SettingsContextValue {
  settings: SiteSettings;
  reload: () => Promise<void>;
}

const DEFAULT: SiteSettings = { idleTimeoutSeconds: 60, disabledFeatures: [] };

const SettingsContext = React.createContext<SettingsContextValue>({
  settings: DEFAULT,
  reload: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SiteSettings>(DEFAULT);

  const reload = React.useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } catch {}
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return (
    <SettingsContext.Provider value={{ settings, reload }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return React.useContext(SettingsContext);
}
