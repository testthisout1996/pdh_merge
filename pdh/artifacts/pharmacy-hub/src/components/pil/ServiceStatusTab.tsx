import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  Server,
  Search,
  FileText,
  Activity,
  Globe,
  Pill,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ServiceStatus = "operational" | "degraded" | "outage";

interface ComponentResult {
  name: string;
  description: string;
  status: ServiceStatus;
  latencyMs: number;
  checkedAt: string;
  detail?: string;
}

type ComponentKey =
  | "webFrontend"
  | "apiServer"
  | "mhraSearch"
  | "mhraDocuments";

type ToolKey = "pdhWebsite" | "pilTools";

interface ToolDef {
  name: string;
  description: string;
  icon: React.ReactNode;
  components: ComponentKey[];
}

const TOOL_ORDER: ToolKey[] = ["pdhWebsite", "pilTools"];

const TOOLS: Record<ToolKey, ToolDef> = {
  pdhWebsite: {
    name: "Pharmacy Hub Website",
    description: "The PDH web app and its frontend.",
    icon: <Globe className="w-5 h-5" />,
    components: ["webFrontend"],
  },
  pilTools: {
    name: "PIL Tools",
    description:
      "Patient Information Leaflet finder and the MHRA services it depends on.",
    icon: <Pill className="w-5 h-5" />,
    components: ["apiServer", "mhraSearch", "mhraDocuments"],
  },
};

const COMPONENT_ICONS: Record<ComponentKey, React.ReactNode> = {
  webFrontend: <Globe className="w-5 h-5" />,
  apiServer: <Server className="w-5 h-5" />,
  mhraSearch: <Search className="w-5 h-5" />,
  mhraDocuments: <FileText className="w-5 h-5" />,
};

const INITIAL_RESULTS: Record<ComponentKey, ComponentResult> = {
  webFrontend: {
    name: "Web Frontend",
    description:
      "The Pharmacy Dispensing Hub frontend served at the site root.",
    status: "operational",
    latencyMs: 0,
    checkedAt: "",
    detail: "Not yet checked",
  },
  apiServer: {
    name: "PIL Finder API",
    description: "Internal API server that processes search requests",
    status: "operational",
    latencyMs: 0,
    checkedAt: "",
    detail: "Not yet checked",
  },
  mhraSearch: {
    name: "MHRA Search Index",
    description:
      "MHRA Azure Search — indexes and retrieves PIL documents",
    status: "operational",
    latencyMs: 0,
    checkedAt: "",
    detail: "Not yet checked",
  },
  mhraDocuments: {
    name: "MHRA Document Store",
    description: "MHRA Azure Blob Storage — hosts the PDF leaflet files",
    status: "operational",
    latencyMs: 0,
    checkedAt: "",
    detail: "Not yet checked",
  },
};

function statusConfig(status: ServiceStatus) {
  switch (status) {
    case "operational":
      return {
        label: "Operational",
        icon: <CheckCircle2 className="w-4 h-4" />,
        badgeClass: "border-green-200 bg-green-50 text-green-700",
        bannerClass: "border-green-200 bg-green-50",
        bannerText: "text-green-800",
        dot: "bg-green-500",
      };
    case "degraded":
      return {
        label: "Degraded",
        icon: <AlertTriangle className="w-4 h-4" />,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        bannerClass: "border-amber-200 bg-amber-50",
        bannerText: "text-amber-800",
        dot: "bg-amber-500",
      };
    case "outage":
      return {
        label: "Outage",
        icon: <XCircle className="w-4 h-4" />,
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        bannerClass: "border-red-200 bg-red-50",
        bannerText: "text-red-800",
        dot: "bg-red-500 animate-pulse",
      };
  }
}

function formatTimestamp(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function combineStatus(statuses: ServiceStatus[]): ServiceStatus {
  if (statuses.length === 0) return "operational";
  if (statuses.every((s) => s === "operational")) return "operational";
  if (statuses.some((s) => s === "outage")) return "outage";
  return "degraded";
}

interface BackendStatusResponse {
  overallStatus: ServiceStatus;
  checkedAt: string;
  services: {
    apiServer: ComponentResult;
    mhraSearch: ComponentResult;
    mhraDocuments: ComponentResult;
  };
}

async function checkWebFrontend(): Promise<ComponentResult> {
  const start = Date.now();
  try {
    const res = await fetch(`/?_=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "text/html" },
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return {
        ...INITIAL_RESULTS.webFrontend,
        status: "operational",
        latencyMs,
        checkedAt: new Date().toISOString(),
        detail: `Frontend responded HTTP ${res.status}`,
      };
    }
    return {
      ...INITIAL_RESULTS.webFrontend,
      status: "degraded",
      latencyMs,
      checkedAt: new Date().toISOString(),
      detail: `Frontend returned HTTP ${res.status}`,
    };
  } catch {
    return {
      ...INITIAL_RESULTS.webFrontend,
      status: "outage",
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
      detail: "Frontend unreachable",
    };
  }
}

const BACKEND_KEY_TO_PARAM: Record<
  Exclude<ComponentKey, "webFrontend">,
  string
> = {
  apiServer: "api-server",
  mhraSearch: "mhra-search",
  mhraDocuments: "mhra-documents",
};

async function checkBackendComponent(
  key: Exclude<ComponentKey, "webFrontend">,
): Promise<ComponentResult> {
  try {
    const res = await fetch(
      `/api/status?service=${BACKEND_KEY_TO_PARAM[key]}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as BackendStatusResponse;
    return data.services[key];
  } catch {
    return {
      ...INITIAL_RESULTS[key],
      status: "outage",
      checkedAt: new Date().toISOString(),
      detail: "Failed to reach status endpoint",
    };
  }
}

async function fetchAllBackend(): Promise<{
  services: BackendStatusResponse["services"];
  checkedAt: string;
} | null> {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as BackendStatusResponse;
    return { services: data.services, checkedAt: data.checkedAt };
  } catch {
    return null;
  }
}

export default function ServiceStatusTab() {
  const [results, setResults] =
    useState<Record<ComponentKey, ComponentResult>>(INITIAL_RESULTS);
  const [overallCheckedAt, setOverallCheckedAt] = useState<string>("");
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingTool, setLoadingTool] = useState<
    Partial<Record<ToolKey, boolean>>
  >({});
  const [loadingComponent, setLoadingComponent] = useState<
    Partial<Record<ComponentKey, boolean>>
  >({});
  const [hasChecked, setHasChecked] = useState(false);

  const refreshAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const [frontend, backend] = await Promise.all([
        checkWebFrontend(),
        fetchAllBackend(),
      ]);
      const now = new Date().toISOString();
      setResults((prev) => ({
        ...prev,
        webFrontend: frontend,
        ...(backend
          ? backend.services
          : {
              apiServer: {
                ...prev.apiServer,
                status: "outage" as ServiceStatus,
                checkedAt: now,
                detail: "Failed to reach status endpoint",
              },
              mhraSearch: {
                ...prev.mhraSearch,
                status: "outage" as ServiceStatus,
                checkedAt: now,
                detail: "Failed to reach status endpoint",
              },
              mhraDocuments: {
                ...prev.mhraDocuments,
                status: "outage" as ServiceStatus,
                checkedAt: now,
                detail: "Failed to reach status endpoint",
              },
            }),
      }));
      setOverallCheckedAt(backend?.checkedAt ?? now);
      setHasChecked(true);
    } finally {
      setLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const refreshComponent = useCallback(async (key: ComponentKey) => {
    setLoadingComponent((prev) => ({ ...prev, [key]: true }));
    try {
      const next =
        key === "webFrontend"
          ? await checkWebFrontend()
          : await checkBackendComponent(key);
      setResults((prev) => ({ ...prev, [key]: next }));
      setHasChecked(true);
      setOverallCheckedAt((prev) => prev || new Date().toISOString());
    } finally {
      setLoadingComponent((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const refreshTool = useCallback(
    async (toolKey: ToolKey) => {
      setLoadingTool((prev) => ({ ...prev, [toolKey]: true }));
      const components = TOOLS[toolKey].components;
      try {
        const updates = await Promise.all(
          components.map(async (k) => {
            if (k === "webFrontend") {
              return [k, await checkWebFrontend()] as const;
            }
            return [k, await checkBackendComponent(k)] as const;
          }),
        );
        setResults((prev) => {
          const next = { ...prev };
          for (const [k, v] of updates) next[k] = v;
          return next;
        });
        setHasChecked(true);
        setOverallCheckedAt((prev) => prev || new Date().toISOString());
      } finally {
        setLoadingTool((prev) => ({ ...prev, [toolKey]: false }));
      }
    },
    [],
  );

  const toolStatus = (toolKey: ToolKey): ServiceStatus =>
    combineStatus(
      TOOLS[toolKey].components.map((k) => results[k].status),
    );

  const overallStatus: ServiceStatus = combineStatus(
    TOOL_ORDER.map((k) => toolStatus(k)),
  );
  const overallCfg = hasChecked ? statusConfig(overallStatus) : null;

  const overallLabel = !hasChecked
    ? "Not yet checked"
    : overallStatus === "operational"
      ? "All Systems Operational"
      : overallStatus === "degraded"
        ? "Partial Service Disruption"
        : "Service Outage Detected";

  return (
    <div className="space-y-6">
      {/* Overall Status — expandable */}
      <Card
        className={`border shadow-sm overflow-hidden ${
          overallCfg ? overallCfg.bannerClass : "border-border bg-muted/20"
        }`}
      >
        <Accordion type="single" collapsible defaultValue="overall">
          <AccordionItem value="overall" className="border-b-0">
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <AccordionTrigger
                className="flex-1 hover:no-underline p-0 [&>svg]:hidden group"
                data-testid="overall-status-trigger"
              >
                <div className="flex items-center gap-3 text-left">
                  {loadingAll ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : overallCfg ? (
                    <div className={`w-3 h-3 rounded-full ${overallCfg.dot}`} />
                  ) : (
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3
                      className={`text-base font-semibold ${
                        overallCfg ? overallCfg.bannerText : "text-foreground"
                      }`}
                    >
                      {loadingAll
                        ? "Checking all services..."
                        : overallLabel}
                    </h3>
                    {overallCheckedAt && !loadingAll && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Last checked: {formatTimestamp(overallCheckedAt)}
                      </p>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 ml-2" />
                </div>
              </AccordionTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  void refreshAll();
                }}
                disabled={loadingAll}
                className="gap-2 shrink-0 bg-white/60"
                data-testid="refresh-all-button"
              >
                {loadingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {hasChecked ? "Refresh All" : "Check All"}
              </Button>
            </div>
            <AccordionContent className="px-5 pb-5">
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border/40 mt-1">
                {TOOL_ORDER.map((toolKey) => {
                  const tool = TOOLS[toolKey];
                  const ts = toolStatus(toolKey);
                  const cfg = hasChecked ? statusConfig(ts) : null;
                  return (
                    <div
                      key={toolKey}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/70 border border-border/40"
                    >
                      <div className="text-muted-foreground shrink-0">
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {tool.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {tool.components.length}{" "}
                          {tool.components.length === 1
                            ? "component"
                            : "components"}
                        </div>
                      </div>
                      {cfg ? (
                        <Badge
                          variant="outline"
                          className={`text-xs gap-1 shrink-0 ${cfg.badgeClass}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground shrink-0"
                        >
                          Not checked
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Per-tool sections */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Tools &amp; Components
        </h3>

        <Accordion type="multiple" className="space-y-3">
          {TOOL_ORDER.map((toolKey) => {
            const tool = TOOLS[toolKey];
            const ts = toolStatus(toolKey);
            const cfg = hasChecked ? statusConfig(ts) : null;
            const isToolLoading = !!loadingTool[toolKey];

            return (
              <Card
                key={toolKey}
                className="border-border/80 shadow-sm overflow-hidden"
              >
                <AccordionItem value={toolKey} className="border-b-0">
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <AccordionTrigger
                      className="flex-1 hover:no-underline p-0 [&>svg]:hidden group"
                      data-testid={`tool-trigger-${toolKey}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span
                          className={`shrink-0 ${
                            cfg ? cfg.bannerText : "text-muted-foreground"
                          }`}
                        >
                          {tool.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">
                              {tool.name}
                            </span>
                            {cfg && (
                              <Badge
                                variant="outline"
                                className={`text-xs gap-1 ${cfg.badgeClass}`}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </Badge>
                            )}
                            {isToolLoading && (
                              <Badge
                                variant="outline"
                                className="text-xs gap-1 border-blue-200 bg-blue-50 text-blue-700"
                              >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Checking...
                              </Badge>
                            )}
                            {!hasChecked && !isToolLoading && (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                Not checked
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 ml-2 shrink-0" />
                      </div>
                    </AccordionTrigger>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        void refreshTool(toolKey);
                      }}
                      disabled={isToolLoading || loadingAll}
                      className="gap-1.5 text-xs shrink-0"
                      data-testid={`refresh-tool-${toolKey}`}
                    >
                      {isToolLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  <AccordionContent className="px-5 pb-4">
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      {tool.components.map((compKey) => {
                        const svc = results[compKey];
                        const isCompLoading = !!loadingComponent[compKey];
                        const compCfg =
                          hasChecked && !isCompLoading
                            ? statusConfig(svc.status)
                            : null;

                        return (
                          <div
                            key={compKey}
                            className="rounded-lg border border-border/60 bg-muted/10 overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row">
                              <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`shrink-0 ${
                                      compCfg
                                        ? compCfg.bannerText
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {COMPONENT_ICONS[compKey]}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-sm text-foreground">
                                        {svc.name}
                                      </span>
                                      {compCfg && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs gap-1 ${compCfg.badgeClass}`}
                                        >
                                          {compCfg.icon}
                                          {compCfg.label}
                                        </Badge>
                                      )}
                                      {isCompLoading && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs gap-1 border-blue-200 bg-blue-50 text-blue-700"
                                        >
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          Checking...
                                        </Badge>
                                      )}
                                      {!hasChecked && !isCompLoading && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs text-muted-foreground"
                                        >
                                          Not checked
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {svc.description}
                                    </p>
                                  </div>
                                </div>

                                {hasChecked &&
                                  !isCompLoading &&
                                  svc.checkedAt && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground pl-7">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        Checked:{" "}
                                        {formatTimestamp(svc.checkedAt)}
                                      </span>
                                      {svc.latencyMs > 0 && (
                                        <span className="flex items-center gap-1">
                                          <Activity className="w-3 h-3 shrink-0" />
                                          Response time: {svc.latencyMs} ms
                                        </span>
                                      )}
                                      {svc.detail && (
                                        <span className="sm:col-span-2 text-foreground/70 italic">
                                          {svc.detail}
                                        </span>
                                      )}
                                    </div>
                                  )}
                              </div>

                              <div className="border-t sm:border-t-0 sm:border-l border-border/60 bg-muted/20 px-4 py-3 sm:w-32 flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    void refreshComponent(compKey)
                                  }
                                  disabled={
                                    isCompLoading ||
                                    isToolLoading ||
                                    loadingAll
                                  }
                                  className="gap-1.5 text-xs w-full"
                                  data-testid={`refresh-component-${compKey}`}
                                >
                                  {isCompLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  )}
                                  {isCompLoading ? "Checking..." : "Refresh"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            );
          })}
        </Accordion>
      </div>

      {/* Status Key */}
      <Card className="border-border/60 bg-muted/20 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Status Key
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Operational
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The service is fully available and responding as expected.
                  All checks passed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700">Degraded</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The service is reachable but experiencing issues — such as
                  slow responses or partial failures.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">Outage</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The service is unreachable or returning errors. Some
                  functionality may be unavailable.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
