import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";
import { useAdminAuditLogs } from "@/shared/hooks/useAdmin";
import {
  User,
  Mail,
  Shield,
  Smartphone,
  Globe,
  Key,
  History,
  LogOut,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/feedback/Skeleton";
import { getInitials, cn } from "@/shared/lib/utils";
import { formatDateTime, timeAgo } from "@/shared/lib/time";

const LOGIN_PAGE_LIMIT = 8;
const ACTIVE_SESSION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function AdminProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: audit, isLoading: auditLoading } = useAdminAuditLogs({
    userId: user?.id,
    limit: LOGIN_PAGE_LIMIT,
  });

  const initials = useMemo(
    () => getInitials(user?.fullName || "SA"),
    [user?.fullName],
  );

  const loginEvents = useMemo(() => {
    const items = audit?.data ?? [];
    return items
      .filter((e) => {
        const a = String(e.action || "").toUpperCase();
        return (
          a.includes("LOGIN") ||
          a.includes("AUTH") ||
          a.includes("SIGN") ||
          a === "SESSION"
        );
      })
      .slice(0, LOGIN_PAGE_LIMIT);
  }, [audit]);

  const activeSessions = useMemo(() => {
    const now = Date.now();
    const sessions: Array<{
      id: string;
      device: string;
      location: string;
      started: string;
      startedAt: number;
      current: boolean;
      ip: string;
    }> = [];
    for (const e of loginEvents) {
      const t = new Date(e.createdAt).getTime();
      if (now - t > ACTIVE_SESSION_WINDOW_MS) continue;
      const isCurrent = sessions.length === 0;
      sessions.push({
        id: e.id,
        device: "Admin Console · Web",
        location: e.ipAddress ? `IP ${e.ipAddress}` : "Unknown location",
        started: timeAgo(e.createdAt),
        startedAt: t,
        current: isCurrent,
        ip: e.ipAddress ?? "—",
      });
      if (sessions.length >= 4) break;
    }
    if (sessions.length === 0) {
      sessions.push({
        id: "current",
        device: "Admin Console · Web",
        location: user?.collegeName ? user.collegeName : "Current session",
        started: "just now",
        startedAt: Date.now(),
        current: true,
        ip: "—",
      });
    }
    return sessions;
  }, [loginEvents, user]);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const passwordHint: string = useMemo(() => {
    if (!user) return "Unknown";
    if (user.updatedAt && user.createdAt && user.updatedAt !== user.createdAt) {
      return `Last updated ${timeAgo(user.updatedAt)}`;
    }
    return `Active since ${formatDateTime(user.createdAt)}`;
  }, [user]);

  return (
    <div className="space-y-5 max-w-4xl" role="main" aria-label="Admin Profile">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Profile</h1>
            <p className="text-xs text-slate-500">
              {isSuperAdmin ? "Super Admin" : user?.role || "Admin"} profile,
              sessions and security
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
            onClick={() => navigate("/admin/settings")}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-700/50 text-red-400 hover:bg-red-900/20 text-xs"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="bg-blue-800 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-base font-bold text-white">
            {user?.fullName || "Super Admin"}
          </h2>
          <p className="text-sm text-slate-500 mb-2">
            {user?.email || "admin@cse.dev"}
          </p>
          <Badge
            className={cn(
              "text-xs mb-4",
              isSuperAdmin
                ? "bg-blue-900/40 text-blue-300 border-blue-700/40"
                : "bg-purple-900/40 text-purple-300 border-purple-700/40",
            )}
          >
            {isSuperAdmin ? "Super Admin" : user?.role || "Admin"}
          </Badge>

          <div className="space-y-2.5 text-left text-sm mt-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="truncate text-xs">
                {user?.email || "admin@cse.dev"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="text-xs">
                {user?.permissions?.length
                  ? `${user.permissions.length} module permissions`
                  : "Full platform access"}
              </span>
            </div>
            {user?.phoneNumber && (
              <div className="flex items-center gap-2 text-slate-400">
                <Smartphone
                  className="w-4 h-4 text-slate-600"
                  aria-hidden="true"
                />
                <span className="text-xs">{user.phoneNumber}</span>
              </div>
            )}
            {user?.bio && (
              <div className="flex items-start gap-2 text-slate-400">
                <Globe
                  className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-xs leading-relaxed">{user.bio}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-800 text-[10px] text-slate-600 space-y-0.5">
              <p>Member since {formatDateTime(user?.createdAt)}</p>
              {user?.lastLoginAt && (
                <p>Last login {timeAgo(user.lastLoginAt)}</p>
              )}
              <p>
                User ID:{" "}
                <code className="bg-slate-800 px-1 rounded">
                  {user?.id ?? "—"}
                </code>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
            onClick={() => navigate("/admin/settings")}
          >
            Account Settings
          </Button>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">
                Login History
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] text-slate-500 hover:text-slate-300"
              onClick={() => navigate("/admin/audit")}
            >
              View all audit
            </Button>
          </div>

          {auditLoading ? (
            <ul className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/30"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-24 shrink-0 ml-3" />
                </li>
              ))}
            </ul>
          ) : loginEvents.length > 0 ? (
            <ul className="space-y-2.5">
              {loginEvents.map((ev, i) => {
                const isCurrent = i === 0;
                return (
                  <li
                    key={ev.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isCurrent
                        ? "border-blue-700/40 bg-blue-900/10"
                        : "border-slate-800 bg-slate-800/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isCurrent ? "bg-blue-800/40" : "bg-slate-800",
                        )}
                      >
                        <Smartphone
                          className={cn(
                            "w-4 h-4",
                            isCurrent ? "text-blue-400" : "text-slate-500",
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          {ev.module || "Admin Console"} · Web
                        </p>
                        <p className="text-[10px] text-slate-600">
                          {ev.ipAddress ? `${ev.ipAddress} · ` : ""}
                          {ev.action}
                          {ev.performer?.fullName
                            ? ` by ${ev.performer.fullName}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">
                        {timeAgo(ev.createdAt)}
                      </p>
                      {isCurrent ? (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          Current session
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">
                          {formatDateTime(ev.createdAt)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No login history yet</p>
              <p className="text-xs opacity-70">Activity will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone
                className="w-4 h-4 text-blue-400"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold text-white">
                Active Sessions
              </h3>
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-400 text-[10px]"
              >
                {activeSessions.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-700/50 text-red-400 hover:bg-red-900/20 text-xs"
              disabled={activeSessions.length <= 1}
            >
              Revoke others
            </Button>
          </div>

          {auditLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800"
                >
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12 shrink-0 ml-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    s.current
                      ? "border-blue-700/40 bg-blue-900/10"
                      : "border-slate-800",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-300 truncate">
                      {s.device}
                    </p>
                    <p className="text-[10px] text-slate-600 truncate">
                      {s.location} · Started {s.started}
                      {s.ip !== "—" && ` · IP ${s.ip}`}
                    </p>
                  </div>
                  {s.current ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium shrink-0 ml-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <button
                      className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors shrink-0 ml-2"
                      aria-label={`Revoke session for ${s.device}`}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-slate-600 mt-3 pt-3 border-t border-slate-800">
            Sessions within the last{" "}
            {ACTIVE_SESSION_WINDOW_MS / (24 * 60 * 60 * 1000)} days are shown.
            Your refresh tokens are rotated on every request.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-white">Security</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "Email Verification",
                status: user?.isVerified ? "Verified" : "Unverified",
                statusColor: user?.isVerified
                  ? "text-emerald-400"
                  : "text-amber-400",
                Icon: user?.isVerified ? CheckCircle2 : Shield,
                action: user?.isVerified ? null : "Verify",
              },
              {
                label: "Password",
                status: passwordHint,
                statusColor: "text-slate-500",
                Icon: Key,
                action: "Change",
                onClick: () => navigate("/admin/settings"),
              },
              {
                label: "Two-Factor Authentication",
                status: "Not configured",
                statusColor: "text-slate-500",
                Icon: Shield,
                action: "Setup",
              },
              {
                label: "API Keys",
                status: isSuperAdmin
                  ? "Full API access"
                  : "Role-restricted access",
                statusColor: "text-blue-400",
                Icon: Key,
                action: "Manage",
              },
              {
                label: "Role Permissions",
                status: user?.permissions?.length
                  ? `${user.permissions.length} scopes`
                  : isSuperAdmin
                    ? "Full platform"
                    : "Standard",
                statusColor: isSuperAdmin
                  ? "text-emerald-400"
                  : "text-slate-500",
                Icon: Shield,
                action: "View",
              },
            ].map(({ label, status, statusColor, Icon, action, onClick }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 bg-slate-800 rounded-md flex items-center justify-center shrink-0">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300">{label}</p>
                    <p className={cn("text-xs mt-0.5 truncate", statusColor)}>
                      {status}
                    </p>
                  </div>
                </div>
                {action ? (
                  <button
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors shrink-0 ml-2"
                    onClick={onClick}
                  >
                    {action}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
