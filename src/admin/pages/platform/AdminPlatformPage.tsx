import { useState, useEffect } from "react";
import {
  Sliders,
  Mail,
  Paintbrush,
  HardDrive,
  AlertTriangle,
  Lock,
  Zap,
  Flag,
  Variable,
  Database,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Copy,
  ShieldCheck,
  KeyRound,
  FileCode,
  Globe,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/shared/hooks/useAdmin";
import { useAdminSystemHealth } from "@/shared/hooks/useAdminAnalytics";

const TABS = [
  { id: "smtp", label: "SMTP", icon: Mail },
  { id: "branding", label: "Branding", icon: Paintbrush },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "maintenance", label: "Maintenance", icon: AlertTriangle },
  { id: "security", label: "Security", icon: Lock },
  { id: "api", label: "API", icon: Zap },
  { id: "flags", label: "Feature Flags", icon: Flag },
  { id: "system", label: "System Vars", icon: Variable },
  { id: "cache", label: "Cache", icon: Database },
];

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-slate-800 rounded-lg", className)} />
  );
}

export default function AdminPlatformPage() {
  const [activeTab, setActiveTab] = useState("smtp");
  const [saved, setSaved] = useState(false);

  // Load persisted settings from DB
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  // Local form state — seeded from DB once loaded
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(true);
  const [codingEnabled, setCodingEnabled] = useState(true);
  const [placementsEnabled, setPlacementsEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [platformName, setPlatformName] = useState("CSE Student Platform");
  const [supportEmail, setSupportEmail] = useState("");
  const [maxUploadMb, setMaxUploadMb] = useState("10");

  // ── Storage tab state ────────────────────────────────────────────────
  const [storageProvider, setStorageProvider] = useState("local");
  const [storageBucket, setStorageBucket] = useState("");
  const [storageRegion, setStorageRegion] = useState("");
  const [storageAccessKey, setStorageAccessKey] = useState("");
  const [storageSecretKey, setStorageSecretKey] = useState("");
  const [storageCdnUrl, setStorageCdnUrl] = useState("");
  const [storagePublicAcl, setStoragePublicAcl] = useState(false);
  const [storageClass, setStorageClass] = useState("standard");
  const [storageKeyVisible, setStorageKeyVisible] = useState(false);

  // ── Security tab state ───────────────────────────────────────────────
  const [secSessionTimeout, setSecSessionTimeout] = useState("60");
  const [secPasswordMinLen, setSecPasswordMinLen] = useState("8");
  const [secRequireMfa, setSecRequireMfa] = useState(false);
  const [secStrongPassword, setSecStrongPassword] = useState(true);
  const [secMaxLoginAttempts, setSecMaxLoginAttempts] = useState("5");
  const [secLockoutMinutes, setSecLockoutMinutes] = useState("15");
  const [secPasswordReuse, setSecPasswordReuse] = useState("5");
  const [secCsrfProtection, setSecCsrfProtection] = useState(true);
  const [secRateLimit, setSecRateLimit] = useState(true);
  const [secCorsOrigins, setSecCorsOrigins] = useState("*");

  // ── API tab state ────────────────────────────────────────────────────
  const [apiRatePerUser, setApiRatePerUser] = useState("60");
  const [apiAllowAnonymous, setApiAllowAnonymous] = useState(false);
  const [apiKeyGeneration, setApiKeyGeneration] = useState(true);
  const [apiKeyExpirationDays, setApiKeyExpirationDays] = useState("90");
  const [apiRequireHttps, setApiRequireHttps] = useState(true);
  const [apiCorsOrigins, setApiCorsOrigins] = useState("*");
  const [apiBodyLimitKb, setApiBodyLimitKb] = useState("1024");
  const [apiRequestLogging, setApiRequestLogging] = useState(false);
  const [apiWebhookSecret, setApiWebhookSecret] = useState("");
  const [apiWebhookVisible, setApiWebhookVisible] = useState(false);

  // ── System Vars tab state ────────────────────────────────────────────
  const [sysCustomCss, setSysCustomCss] = useState("");
  const [sysCustomJs, setSysCustomJs] = useState("");
  const [sysDefaultLanding, setSysDefaultLanding] = useState("/home");
  const [sysTermsUrl, setSysTermsUrl] = useState("");
  const [sysPrivacyUrl, setSysPrivacyUrl] = useState("");
  const [sysHelpUrl, setSysHelpUrl] = useState("");
  const [sysDefaultRole, setSysDefaultRole] = useState("STUDENT");
  const [sysPublicProfiles, setSysPublicProfiles] = useState(true);
  const [sysEnableAnalytics, setSysEnableAnalytics] = useState(true);
  const [sysGaId, setSysGaId] = useState("");

  // System health for cache panel
  const { data: health } = useAdminSystemHealth();

  // Seed local state when settings load
  useEffect(() => {
    if (!settings) return;
    const s = settings as Record<string, unknown>;
    if (s["smtp_host"]) setSmtpHost(String(s["smtp_host"]));
    if (s["smtp_port"]) setSmtpPort(String(s["smtp_port"]));
    if (s["smtp_user"]) setSmtpUser(String(s["smtp_user"]));
    if (s["smtp_from"]) setSmtpFrom(String(s["smtp_from"]));
    if (s["maintenanceMode"] !== undefined)
      setMaintenanceMode(Boolean(s["maintenanceMode"]));
    if (s["registrationEnabled"] !== undefined)
      setRegistrationsOpen(Boolean(s["registrationEnabled"]));
    if (s["platformName"]) setPlatformName(String(s["platformName"]));
    if (s["supportEmail"]) setSupportEmail(String(s["supportEmail"]));
    if (s["maxUploadSize"]) setMaxUploadMb(String(s["maxUploadSize"]));
    // Storage
    if (s["storage_provider"])
      setStorageProvider(String(s["storage_provider"]));
    if (s["storage_bucket"]) setStorageBucket(String(s["storage_bucket"]));
    if (s["storage_region"]) setStorageRegion(String(s["storage_region"]));
    if (s["storage_access_key"])
      setStorageAccessKey(String(s["storage_access_key"]));
    if (s["storage_secret_key"])
      setStorageSecretKey(String(s["storage_secret_key"]));
    if (s["storage_cdn_url"]) setStorageCdnUrl(String(s["storage_cdn_url"]));
    if (s["storage_public_acl"] !== undefined)
      setStoragePublicAcl(Boolean(s["storage_public_acl"]));
    if (s["storage_class"]) setStorageClass(String(s["storage_class"]));
    // Security
    if (s["sec_session_timeout"])
      setSecSessionTimeout(String(s["sec_session_timeout"]));
    if (s["sec_password_min_len"])
      setSecPasswordMinLen(String(s["sec_password_min_len"]));
    if (s["sec_require_mfa"] !== undefined)
      setSecRequireMfa(Boolean(s["sec_require_mfa"]));
    if (s["sec_strong_password"] !== undefined)
      setSecStrongPassword(Boolean(s["sec_strong_password"]));
    if (s["sec_max_login_attempts"])
      setSecMaxLoginAttempts(String(s["sec_max_login_attempts"]));
    if (s["sec_lockout_minutes"])
      setSecLockoutMinutes(String(s["sec_lockout_minutes"]));
    if (s["sec_password_reuse"])
      setSecPasswordReuse(String(s["sec_password_reuse"]));
    if (s["sec_csrf"] !== undefined)
      setSecCsrfProtection(Boolean(s["sec_csrf"]));
    if (s["sec_rate_limit"] !== undefined)
      setSecRateLimit(Boolean(s["sec_rate_limit"]));
    if (s["sec_cors_origins"]) setSecCorsOrigins(String(s["sec_cors_origins"]));
    // API
    if (s["api_rate_per_user"])
      setApiRatePerUser(String(s["api_rate_per_user"]));
    if (s["api_allow_anon"] !== undefined)
      setApiAllowAnonymous(Boolean(s["api_allow_anon"]));
    if (s["api_key_gen"] !== undefined)
      setApiKeyGeneration(Boolean(s["api_key_gen"]));
    if (s["api_key_expiry_days"])
      setApiKeyExpirationDays(String(s["api_key_expiry_days"]));
    if (s["api_require_https"] !== undefined)
      setApiRequireHttps(Boolean(s["api_require_https"]));
    if (s["api_cors_origins"]) setApiCorsOrigins(String(s["api_cors_origins"]));
    if (s["api_body_limit_kb"])
      setApiBodyLimitKb(String(s["api_body_limit_kb"]));
    if (s["api_request_logging"] !== undefined)
      setApiRequestLogging(Boolean(s["api_request_logging"]));
    if (s["api_webhook_secret"])
      setApiWebhookSecret(String(s["api_webhook_secret"]));
    // System Vars
    if (s["sys_custom_css"]) setSysCustomCss(String(s["sys_custom_css"]));
    if (s["sys_custom_js"]) setSysCustomJs(String(s["sys_custom_js"]));
    if (s["sys_default_landing"])
      setSysDefaultLanding(String(s["sys_default_landing"]));
    if (s["sys_terms_url"]) setSysTermsUrl(String(s["sys_terms_url"]));
    if (s["sys_privacy_url"]) setSysPrivacyUrl(String(s["sys_privacy_url"]));
    if (s["sys_help_url"]) setSysHelpUrl(String(s["sys_help_url"]));
    if (s["sys_default_role"]) setSysDefaultRole(String(s["sys_default_role"]));
    if (s["sys_public_profiles"] !== undefined)
      setSysPublicProfiles(Boolean(s["sys_public_profiles"]));
    if (s["sys_enable_analytics"] !== undefined)
      setSysEnableAnalytics(Boolean(s["sys_enable_analytics"]));
    if (s["sys_ga_id"]) setSysGaId(String(s["sys_ga_id"]));
  }, [settings]);

  const save = (data: Record<string, unknown>) => {
    updateSettings.mutate(data as never, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };

  return (
    <div className="space-y-5" role="main" aria-label="Platform Settings">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <Sliders className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Platform Settings</h1>
            <p className="text-xs text-slate-500">
              System-wide configuration — persisted to database
            </p>
          </div>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/30 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">
              Saved successfully
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-5">
        {/* Side nav */}
        <div className="w-48 flex-shrink-0">
          <nav
            className="space-y-0.5"
            aria-label="Platform settings navigation"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeTab === id
                    ? "bg-blue-600/20 text-blue-300 font-medium"
                    : "text-slate-500 hover:bg-slate-800 hover:text-slate-300",
                )}
                aria-current={activeTab === id ? "page" : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {isLoading ? (
            <div className="space-y-4 max-w-lg">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <>
              {/* ── SMTP ─────────────────────────────────────────────────── */}
              {activeTab === "smtp" && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">
                    SMTP Configuration
                  </h2>
                  {[
                    {
                      id: "smtp-host",
                      label: "SMTP Host",
                      value: smtpHost,
                      set: setSmtpHost,
                      placeholder: "smtp.gmail.com",
                    },
                    {
                      id: "smtp-port",
                      label: "Port",
                      value: smtpPort,
                      set: setSmtpPort,
                      placeholder: "587",
                    },
                    {
                      id: "smtp-user",
                      label: "Username",
                      value: smtpUser,
                      set: setSmtpUser,
                      placeholder: "admin@cse.dev",
                    },
                    {
                      id: "smtp-from",
                      label: "From Email",
                      value: smtpFrom,
                      set: setSmtpFrom,
                      placeholder: "noreply@cse.dev",
                    },
                  ].map(({ id, label, value, set, placeholder }) => (
                    <div key={id}>
                      <label
                        htmlFor={id}
                        className="block text-xs font-medium text-slate-400 mb-1.5"
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      disabled={updateSettings.isPending}
                      onClick={() =>
                        save({
                          smtp_host: smtpHost,
                          smtp_port: smtpPort,
                          smtp_user: smtpUser,
                          smtp_from: smtpFrom,
                        })
                      }
                    >
                      {updateSettings.isPending ? "Saving…" : "Save SMTP"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Branding ─────────────────────────────────────────────── */}
              {activeTab === "branding" && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">
                    Branding
                  </h2>
                  <div>
                    <label
                      htmlFor="platform-name"
                      className="block text-xs font-medium text-slate-400 mb-1.5"
                    >
                      Platform Name
                    </label>
                    <input
                      id="platform-name"
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="support-email"
                      className="block text-xs font-medium text-slate-400 mb-1.5"
                    >
                      Support Email
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="max-upload"
                      className="block text-xs font-medium text-slate-400 mb-1.5"
                    >
                      Max Upload Size (MB)
                    </label>
                    <input
                      id="max-upload"
                      type="number"
                      value={maxUploadMb}
                      onChange={(e) => setMaxUploadMb(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    disabled={updateSettings.isPending}
                    onClick={() =>
                      save({
                        platformName,
                        supportEmail,
                        maxUploadSize: Number(maxUploadMb),
                      })
                    }
                  >
                    {updateSettings.isPending ? "Saving…" : "Save Branding"}
                  </Button>
                </div>
              )}

              {/* ── Maintenance ───────────────────────────────────────────── */}
              {activeTab === "maintenance" && (
                <div className="space-y-5 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">
                    Maintenance Mode
                  </h2>
                  <div
                    className={cn(
                      "p-4 rounded-xl border",
                      maintenanceMode
                        ? "bg-amber-900/20 border-amber-700/40"
                        : "bg-slate-800/50 border-slate-700",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="maintenance-toggle"
                          className="text-sm font-semibold text-white"
                        >
                          Maintenance Mode
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Block all user access temporarily
                        </p>
                      </div>
                      <Switch
                        id="maintenance-toggle"
                        checked={maintenanceMode}
                        onCheckedChange={(v) => {
                          setMaintenanceMode(v);
                          save({ maintenanceMode: v });
                        }}
                      />
                    </div>
                    {maintenanceMode && (
                      <div className="mt-3 flex items-center gap-2 text-amber-400 text-xs">
                        <AlertTriangle
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                        Platform is currently in maintenance mode — users cannot
                        access the app
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Feature Flags ─────────────────────────────────────────── */}
              {activeTab === "flags" && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">
                    Feature Flags
                  </h2>
                  {[
                    {
                      id: "reg",
                      label: "Open Registrations",
                      desc: "Allow new user sign-ups",
                      value: registrationsOpen,
                      set: setRegistrationsOpen,
                      key: "registrationEnabled",
                    },
                    {
                      id: "coding",
                      label: "Coding Module",
                      desc: "Enable the coding practice section",
                      value: codingEnabled,
                      set: setCodingEnabled,
                      key: "codingEnabled",
                    },
                    {
                      id: "placements",
                      label: "Placement Module",
                      desc: "Enable the placement ecosystem",
                      value: placementsEnabled,
                      set: setPlacementsEnabled,
                      key: "placementsEnabled",
                    },
                    {
                      id: "ai",
                      label: "AI Features",
                      desc: "Enable AI-powered features (beta)",
                      value: aiEnabled,
                      set: setAiEnabled,
                      key: "aiEnabled",
                    },
                    {
                      id: "beta",
                      label: "Beta Features",
                      desc: "Show beta features to users",
                      value: betaFeatures,
                      set: setBetaFeatures,
                      key: "betaFeatures",
                    },
                  ].map(({ id, label, desc, value, set, key }) => (
                    <div
                      key={id}
                      className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
                    >
                      <div>
                        <Label
                          htmlFor={id}
                          className="text-sm font-medium text-slate-300"
                        >
                          {label}
                        </Label>
                        <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                      </div>
                      <Switch
                        id={id}
                        checked={value}
                        onCheckedChange={(v) => {
                          set(v);
                          save({ [key]: v });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Cache ─────────────────────────────────────────────────── */}
              {activeTab === "cache" && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">
                    Cache Management
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Redis Cache",
                        status:
                          health?.services.find((s) => s.name === "Redis")
                            ?.status ?? "unknown",
                        latency:
                          health?.services.find((s) => s.name === "Redis")
                            ?.latencyMs ?? null,
                      },
                      {
                        label: "PostgreSQL",
                        status:
                          health?.services.find((s) => s.name === "PostgreSQL")
                            ?.status ?? "unknown",
                        latency:
                          health?.services.find((s) => s.name === "PostgreSQL")
                            ?.latencyMs ?? null,
                      },
                      {
                        label: "Static Assets",
                        status: "healthy",
                        latency: null,
                      },
                      { label: "CDN Cache", status: "healthy", latency: null },
                    ].map(({ label, status, latency }) => (
                      <div
                        key={label}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-4"
                      >
                        <p className="text-sm font-medium text-slate-200">
                          {label}
                        </p>
                        {latency !== null && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {latency}ms latency
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              status === "healthy"
                                ? "bg-emerald-400"
                                : "bg-amber-400",
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs capitalize",
                              status === "healthy"
                                ? "text-emerald-400"
                                : "text-amber-400",
                            )}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-700/50 text-red-400 hover:bg-red-900/20 text-xs"
                  >
                    Clear All Caches
                  </Button>
                </div>
              )}

              {/* ── Storage ─────────────────────────────────────────────────── */}
              {activeTab === "storage" && (
                <div className="space-y-5 max-w-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-semibold text-white">
                      Storage Configuration
                    </h2>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/70">
                      Provider: {storageProvider}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="storage-provider"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Storage Provider
                      </Label>
                      <select
                        id="storage-provider"
                        value={storageProvider}
                        onChange={(e) => setStorageProvider(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="local">Local Filesystem</option>
                        <option value="s3">AWS S3</option>
                        <option value="gcs">Google Cloud Storage</option>
                        <option value="azure">Azure Blob</option>
                        <option value="r2">Cloudflare R2</option>
                      </select>
                    </div>
                    <div>
                      <Label
                        htmlFor="storage-class"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Storage Class
                      </Label>
                      <select
                        id="storage-class"
                        value={storageClass}
                        onChange={(e) => setStorageClass(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="ia">Infrequent Access</option>
                        <option value="glacier">Archive / Glacier</option>
                      </select>
                    </div>
                  </div>

                  {storageProvider !== "local" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor="storage-bucket"
                            className="text-xs font-medium text-slate-400 mb-1.5 block"
                          >
                            Bucket / Container
                          </Label>
                          <Input
                            id="storage-bucket"
                            value={storageBucket}
                            onChange={(e) => setStorageBucket(e.target.value)}
                            placeholder="cse-student-uploads"
                            className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="storage-region"
                            className="text-xs font-medium text-slate-400 mb-1.5 block"
                          >
                            Region
                          </Label>
                          <Input
                            id="storage-region"
                            value={storageRegion}
                            onChange={(e) => setStorageRegion(e.target.value)}
                            placeholder="us-east-1"
                            className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="storage-access"
                          className="text-xs font-medium text-slate-400 mb-1.5 block"
                        >
                          Access Key ID
                        </Label>
                        <Input
                          id="storage-access"
                          value={storageAccessKey}
                          onChange={(e) => setStorageAccessKey(e.target.value)}
                          placeholder="AKIA..."
                          className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-xs focus-visible:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="storage-secret"
                          className="text-xs font-medium text-slate-400 mb-1.5 block"
                        >
                          Secret Access Key
                        </Label>
                        <div className="relative">
                          <Input
                            id="storage-secret"
                            type={storageKeyVisible ? "text" : "password"}
                            value={storageSecretKey}
                            onChange={(e) =>
                              setStorageSecretKey(e.target.value)
                            }
                            placeholder="••••••••••••••••"
                            className="bg-slate-800 border-slate-700 text-slate-200 pr-9 font-mono text-xs focus-visible:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setStorageKeyVisible((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            aria-label={
                              storageKeyVisible ? "Hide key" : "Show key"
                            }
                          >
                            {storageKeyVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label
                      htmlFor="storage-cdn"
                      className="text-xs font-medium text-slate-400 mb-1.5 block"
                    >
                      CDN URL (optional)
                    </Label>
                    <Input
                      id="storage-cdn"
                      value={storageCdnUrl}
                      onChange={(e) => setStorageCdnUrl(e.target.value)}
                      placeholder="https://cdn.cse-student.dev"
                      className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div>
                      <Label
                        htmlFor="storage-acl"
                        className="text-sm font-medium text-slate-200"
                      >
                        Default Public ACL
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        New uploads will be publicly readable by default
                      </p>
                    </div>
                    <Switch
                      id="storage-acl"
                      checked={storagePublicAcl}
                      onCheckedChange={setStoragePublicAcl}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      disabled={updateSettings.isPending}
                      onClick={() =>
                        save({
                          storage_provider: storageProvider,
                          storage_bucket: storageBucket,
                          storage_region: storageRegion,
                          storage_access_key: storageAccessKey,
                          storage_secret_key: storageSecretKey,
                          storage_cdn_url: storageCdnUrl,
                          storage_public_acl: storagePublicAcl,
                          storage_class: storageClass,
                        })
                      }
                    >
                      {updateSettings.isPending ? "Saving…" : "Save Storage"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Security ──────────────────────────────────────────────── */}
              {activeTab === "security" && (
                <div className="space-y-5 max-w-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">
                      Security & Access
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="sec-session"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="sec-session"
                        type="number"
                        value={secSessionTimeout}
                        onChange={(e) => setSecSessionTimeout(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="sec-pw-len"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Password Min Length
                      </Label>
                      <Input
                        id="sec-pw-len"
                        type="number"
                        value={secPasswordMinLen}
                        onChange={(e) => setSecPasswordMinLen(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="sec-attempts"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Max Login Attempts
                      </Label>
                      <Input
                        id="sec-attempts"
                        type="number"
                        value={secMaxLoginAttempts}
                        onChange={(e) => setSecMaxLoginAttempts(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="sec-lockout"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Lockout Duration (minutes)
                      </Label>
                      <Input
                        id="sec-lockout"
                        type="number"
                        value={secLockoutMinutes}
                        onChange={(e) => setSecLockoutMinutes(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label
                        htmlFor="sec-reuse"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Prevent Password Reuse (last N)
                      </Label>
                      <Input
                        id="sec-reuse"
                        type="number"
                        value={secPasswordReuse}
                        onChange={(e) => setSecPasswordReuse(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: "sec-mfa",
                        label: "Require Multi-Factor Auth",
                        desc: "Force all users to enroll MFA",
                        value: secRequireMfa,
                        set: setSecRequireMfa,
                        key: "sec_require_mfa",
                      },
                      {
                        id: "sec-strong",
                        label: "Strong Password Policy",
                        desc: "Uppercase, number and special character required",
                        value: secStrongPassword,
                        set: setSecStrongPassword,
                        key: "sec_strong_password",
                      },
                      {
                        id: "sec-csrf",
                        label: "CSRF Protection",
                        desc: "Enable double-submit CSRF tokens on state-changing requests",
                        value: secCsrfProtection,
                        set: setSecCsrfProtection,
                        key: "sec_csrf",
                      },
                      {
                        id: "sec-rate",
                        label: "Rate Limiting",
                        desc: "Throttle repeated authentication attempts",
                        value: secRateLimit,
                        set: setSecRateLimit,
                        key: "sec_rate_limit",
                      },
                    ].map(({ id, label, desc, value, set, key }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between py-3 px-3 bg-slate-800/50 border border-slate-700 rounded-xl"
                      >
                        <div>
                          <Label
                            htmlFor={id}
                            className="text-sm font-medium text-slate-200"
                          >
                            {label}
                          </Label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {desc}
                          </p>
                        </div>
                        <Switch
                          id={id}
                          checked={value}
                          onCheckedChange={(v) => set(v)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label
                      htmlFor="sec-cors"
                      className="text-xs font-medium text-slate-400 mb-1.5 block"
                    >
                      Allowed CORS Origins (comma-separated)
                    </Label>
                    <Input
                      id="sec-cors"
                      value={secCorsOrigins}
                      onChange={(e) => setSecCorsOrigins(e.target.value)}
                      placeholder="https://app.cse.dev, https://admin.cse.dev"
                      className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-xs focus-visible:ring-blue-500"
                    />
                  </div>

                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    disabled={updateSettings.isPending}
                    onClick={() =>
                      save({
                        sec_session_timeout: Number(secSessionTimeout),
                        sec_password_min_len: Number(secPasswordMinLen),
                        sec_require_mfa: secRequireMfa,
                        sec_strong_password: secStrongPassword,
                        sec_max_login_attempts: Number(secMaxLoginAttempts),
                        sec_lockout_minutes: Number(secLockoutMinutes),
                        sec_password_reuse: Number(secPasswordReuse),
                        sec_csrf: secCsrfProtection,
                        sec_rate_limit: secRateLimit,
                        sec_cors_origins: secCorsOrigins,
                      })
                    }
                  >
                    {updateSettings.isPending ? "Saving…" : "Save Security"}
                  </Button>
                </div>
              )}

              {/* ── API ─────────────────────────────────────────────────── */}
              {activeTab === "api" && (
                <div className="space-y-5 max-w-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-semibold text-white">
                      API Gateway
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="api-rate"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Rate Limit (requests/user/min)
                      </Label>
                      <Input
                        id="api-rate"
                        type="number"
                        value={apiRatePerUser}
                        onChange={(e) => setApiRatePerUser(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="api-expiry"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Key Expiry (days)
                      </Label>
                      <Input
                        id="api-expiry"
                        type="number"
                        value={apiKeyExpirationDays}
                        onChange={(e) =>
                          setApiKeyExpirationDays(e.target.value)
                        }
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="api-body"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Body Size Limit (KB)
                      </Label>
                      <Input
                        id="api-body"
                        type="number"
                        value={apiBodyLimitKb}
                        onChange={(e) => setApiBodyLimitKb(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label
                        htmlFor="api-cors"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        API CORS Origins
                      </Label>
                      <Input
                        id="api-cors"
                        value={apiCorsOrigins}
                        onChange={(e) => setApiCorsOrigins(e.target.value)}
                        placeholder="* or comma-separated origins"
                        className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-xs focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="api-webhook"
                      className="text-xs font-medium text-slate-400 mb-1.5 block"
                    >
                      Webhook Signing Secret
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="api-webhook"
                          type={apiWebhookVisible ? "text" : "password"}
                          value={apiWebhookSecret}
                          onChange={(e) => setApiWebhookSecret(e.target.value)}
                          placeholder="whsec_••••••••••••"
                          className="bg-slate-800 border-slate-700 text-slate-200 pr-9 font-mono text-xs focus-visible:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setApiWebhookVisible((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          aria-label={
                            apiWebhookVisible ? "Hide secret" : "Show secret"
                          }
                        >
                          {apiWebhookVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                        onClick={() => {
                          const arr = new Uint8Array(32);
                          crypto.getRandomValues(arr);
                          setApiWebhookSecret(
                            "whsec_" +
                              Array.from(arr, (b) =>
                                b.toString(16).padStart(2, "0"),
                              ).join(""),
                          );
                        }}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: "api-anon",
                        label: "Allow Anonymous Access",
                        desc: "Permit unauthenticated API calls (low security)",
                        value: apiAllowAnonymous,
                        set: setApiAllowAnonymous,
                        key: "api_allow_anon",
                      },
                      {
                        id: "api-key-gen",
                        label: "User API Key Generation",
                        desc: "Let users issue personal API keys",
                        value: apiKeyGeneration,
                        set: setApiKeyGeneration,
                        key: "api_key_gen",
                      },
                      {
                        id: "api-https",
                        label: "Enforce HTTPS",
                        desc: "Reject requests over plain HTTP",
                        value: apiRequireHttps,
                        set: setApiRequireHttps,
                        key: "api_require_https",
                      },
                      {
                        id: "api-log",
                        label: "Request Logging",
                        desc: "Verbose access logs (increased storage)",
                        value: apiRequestLogging,
                        set: setApiRequestLogging,
                        key: "api_request_logging",
                      },
                    ].map(({ id, label, desc, value, set, key }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between py-3 px-3 bg-slate-800/50 border border-slate-700 rounded-xl"
                      >
                        <div>
                          <Label
                            htmlFor={id}
                            className="text-sm font-medium text-slate-200"
                          >
                            {label}
                          </Label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {desc}
                          </p>
                        </div>
                        <Switch
                          id={id}
                          checked={value}
                          onCheckedChange={(v) => set(v)}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    disabled={updateSettings.isPending}
                    onClick={() =>
                      save({
                        api_rate_per_user: Number(apiRatePerUser),
                        api_allow_anon: apiAllowAnonymous,
                        api_key_gen: apiKeyGeneration,
                        api_key_expiry_days: Number(apiKeyExpirationDays),
                        api_require_https: apiRequireHttps,
                        api_cors_origins: apiCorsOrigins,
                        api_body_limit_kb: Number(apiBodyLimitKb),
                        api_request_logging: apiRequestLogging,
                        api_webhook_secret: apiWebhookSecret,
                      })
                    }
                  >
                    {updateSettings.isPending ? "Saving…" : "Save API"}
                  </Button>
                </div>
              )}

              {/* ── System Vars ──────────────────────────────────────────── */}
              {activeTab === "system" && (
                <div className="space-y-5 max-w-3xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Variable className="w-4 h-4 text-violet-400" />
                    <h2 className="text-sm font-semibold text-white">
                      System Variables
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="sys-landing"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Default Landing Page
                      </Label>
                      <Input
                        id="sys-landing"
                        value={sysDefaultLanding}
                        onChange={(e) => setSysDefaultLanding(e.target.value)}
                        placeholder="/home"
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="sys-role"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Default New-User Role
                      </Label>
                      <select
                        id="sys-role"
                        value={sysDefaultRole}
                        onChange={(e) => setSysDefaultRole(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>
                    <div>
                      <Label
                        htmlFor="sys-terms"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Terms of Service URL
                      </Label>
                      <Input
                        id="sys-terms"
                        value={sysTermsUrl}
                        onChange={(e) => setSysTermsUrl(e.target.value)}
                        placeholder="https://cse.dev/terms"
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="sys-privacy"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Privacy Policy URL
                      </Label>
                      <Input
                        id="sys-privacy"
                        value={sysPrivacyUrl}
                        onChange={(e) => setSysPrivacyUrl(e.target.value)}
                        placeholder="https://cse.dev/privacy"
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label
                        htmlFor="sys-help"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Help / Documentation URL
                      </Label>
                      <Input
                        id="sys-help"
                        value={sysHelpUrl}
                        onChange={(e) => setSysHelpUrl(e.target.value)}
                        placeholder="https://docs.cse.dev"
                        className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label
                        htmlFor="sys-ga"
                        className="text-xs font-medium text-slate-400 mb-1.5 block"
                      >
                        Google Analytics ID (optional)
                      </Label>
                      <Input
                        id="sys-ga"
                        value={sysGaId}
                        onChange={(e) => setSysGaId(e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-xs focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: "sys-profiles",
                        label: "Public User Profiles",
                        desc: "Allow profile pages to be visible publicly",
                        value: sysPublicProfiles,
                        set: setSysPublicProfiles,
                        key: "sys_public_profiles",
                      },
                      {
                        id: "sys-analytics",
                        label: "Analytics Tracking",
                        desc: "Collect anonymous usage analytics",
                        value: sysEnableAnalytics,
                        set: setSysEnableAnalytics,
                        key: "sys_enable_analytics",
                      },
                    ].map(({ id, label, desc, value, set, key }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between py-3 px-3 bg-slate-800/50 border border-slate-700 rounded-xl"
                      >
                        <div>
                          <Label
                            htmlFor={id}
                            className="text-sm font-medium text-slate-200"
                          >
                            {label}
                          </Label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {desc}
                          </p>
                        </div>
                        <Switch
                          id={id}
                          checked={value}
                          onCheckedChange={(v) => set(v)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label
                      htmlFor="sys-css"
                      className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5"
                    >
                      <FileCode className="w-3 h-3" /> Custom CSS (injected into
                      every page
                    </Label>
                    <textarea
                      id="sys-css"
                      value={sysCustomCss}
                      onChange={(e) => setSysCustomCss(e.target.value)}
                      rows={5}
                      placeholder=".my-class { color: red; }"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="sys-js"
                      className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5"
                    >
                      <Globe className="w-3 h-3" /> Custom JS / Tag Manager
                      snippet
                    </Label>
                    <textarea
                      id="sys-js"
                      value={sysCustomJs}
                      onChange={(e) => setSysCustomJs(e.target.value)}
                      rows={5}
                      placeholder="// runs after DOMContentLoaded"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    disabled={updateSettings.isPending}
                    onClick={() =>
                      save({
                        sys_custom_css: sysCustomCss,
                        sys_custom_js: sysCustomJs,
                        sys_default_landing: sysDefaultLanding,
                        sys_terms_url: sysTermsUrl,
                        sys_privacy_url: sysPrivacyUrl,
                        sys_help_url: sysHelpUrl,
                        sys_default_role: sysDefaultRole,
                        sys_public_profiles: sysPublicProfiles,
                        sys_enable_analytics: sysEnableAnalytics,
                        sys_ga_id: sysGaId,
                      })
                    }
                  >
                    {updateSettings.isPending ? "Saving…" : "Save System"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
