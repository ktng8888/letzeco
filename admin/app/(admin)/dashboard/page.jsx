'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BatteryCharging,
  BarChart3,
  ClipboardCheck,
  Droplets,
  Layers3,
  Leaf,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

import dashboardService from '../../../services/dashboardService';
import PageHeader from '../../../components/layout/PageHeader';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getImageUrl } from '../../../utils/imageUrl';

const nf = new Intl.NumberFormat('en-US');

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const dashboard = useMemo(() => {
    const impact = data?.environmental_impact || {};
    const topActions = data?.top_actions || [];
    const topBadges = data?.top_badges || [];
    const maxLogs = Number(topActions[0]?.log_count || 1);
    const maxBadgeUnlocks = Number(topBadges[0]?.unlock_count || 1);
    const totalChallengeCount = Number(data?.total_challenges || 0);
    const activeChallengeCount = Number(data?.active_challenges || 0);
    const activeChallengeRate = totalChallengeCount
      ? Math.round((activeChallengeCount / totalChallengeCount) * 100)
      : 0;
    const totalLogs = Number(data?.total_actions_logged || 0);
    const totalUsers = Number(data?.total_users || 0);
    const logsPerUser = totalUsers ? (totalLogs / totalUsers).toFixed(1) : '0.0';

    return {
      impact,
      topActions,
      topBadges,
      maxLogs,
      maxBadgeUnlocks,
      totalChallengeCount,
      activeChallengeCount,
      activeChallengeRate,
      totalLogs,
      totalUsers,
      logsPerUser,
    };
  }, [data]);

  if (isLoading) return <LoadingSpinner fullPage />;

  const metricCards = [
    {
      label: 'Total Users',
      value: dashboard.totalUsers,
      note: `${dashboard.logsPerUser} logs per user`,
      icon: Users,
      tone: 'green',
    },
    {
      label: 'Admins',
      value: data?.total_admins || 0,
      note: 'Admin accounts',
      icon: ShieldCheck,
      tone: 'slate',
    },
    {
      label: 'Action Categories',
      value: data?.total_categories || 0,
      note: 'Organized action groups',
      icon: Layers3,
      tone: 'blue',
    },
    {
      label: 'Eco Actions',
      value: data?.total_actions_available || 0,
      note: `${nf.format(dashboard.totalLogs)} completed logs`,
      icon: Zap,
      tone: 'amber',
    },
  ];

  const impactCards = [
    {
      label: 'CO2 Saved',
      value: formatImpact(dashboard.impact.total_co2),
      unit: 'kg',
      icon: Leaf,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Water Saved',
      value: formatImpact(dashboard.impact.total_litre),
      unit: 'L',
      icon: Droplets,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Energy Saved',
      value: formatImpact(dashboard.impact.total_kwh),
      unit: 'kWh',
      icon: BatteryCharging,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle="A quick operational view of users, eco activity, challenges, and platform impact."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                Platform Pulse
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {nf.format(dashboard.totalLogs)} completed eco actions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Users have logged measurable impact across transport, energy,
                water, waste, food, and shopping habits.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-green-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-green-700">
                  Active Challenges
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {dashboard.activeChallengeCount} / {dashboard.totalChallengeCount}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Challenge Health</h3>
              <p className="text-sm text-gray-500">Live challenge availability</p>
            </div>
            <Target className="text-green-600" size={22} />
          </div>

          <div className="mt-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {dashboard.activeChallengeRate}%
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  of challenges are active
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {dashboard.activeChallengeCount} active
              </p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${dashboard.activeChallengeRate}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <MiniStat
              icon={ClipboardCheck}
              label="Total Challenges"
              value={dashboard.totalChallengeCount}
            />
            <MiniStat
              icon={Trophy}
              label="Completed Logs"
              value={dashboard.totalLogs}
            />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 items-start xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <SectionTitle
              icon={Leaf}
              title="Environmental Impact"
              subtitle="All-time savings from completed user actions"
            />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {impactCards.map((item) => (
                <ImpactRow key={item.label} {...item} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <SectionTitle
              icon={Trophy}
              title="Top Badges Unlocked"
              subtitle="Badges most frequently earned by users"
              tag="Top 5"
            />

            <div className="mt-5 space-y-3">
              {dashboard.topBadges.length > 0 ? (
                dashboard.topBadges.map((badge, i) => (
                  <BadgeUnlockRow
                    key={badge.id || `${badge.name}-${i}`}
                    badge={badge}
                    index={i}
                    maxUnlocks={dashboard.maxBadgeUnlocks}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No badges unlocked yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Badge popularity will appear after users earn rewards.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <SectionTitle
            icon={BarChart3}
            title="Popular Eco Actions"
            subtitle="Top completed actions by log count"
            tag="All Time"
          />

          <div className="mt-5 space-y-3">
            {dashboard.topActions.length > 0 ? (
              dashboard.topActions.map((action, i) => (
                <PopularActionRow
                  key={`${action.name}-${i}`}
                  action={action}
                  index={i}
                  maxLogs={dashboard.maxLogs}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No completed actions yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Popular actions will appear after users start logging.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ value, label, note, icon: Icon, tone }) {
  const toneClass = {
    green: 'bg-green-50 text-green-600',
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  }[tone];

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">{nf.format(value)}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">{note}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{nf.format(value)}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, tag }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      {tag && (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          {tag}
        </span>
      )}
    </div>
  );
}

function ImpactRow({ label, value, unit, icon: Icon, color, bg }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}>
          <Icon size={18} />
        </div>
        <p className="min-w-0 text-sm font-medium text-gray-700">{label}</p>
      </div>
      <div className="mt-3 flex items-end gap-1">
        <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500">{unit}</p>
      </div>
    </div>
  );
}

function PopularActionRow({ action, index, maxLogs }) {
  const logCount = Number(action.log_count || 0);
  const width = Math.max(6, (logCount / maxLogs) * 100);

  return (
    <div className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-600">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-gray-800">
            {action.name}
          </p>
          {index === 0 && (
            <span className="hidden items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 sm:flex">
              <TrendingUp size={12} />
              Leading
            </span>
          )}
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{nf.format(logCount)}</p>
        <p className="text-xs text-gray-500">logs</p>
      </div>
    </div>
  );
}

function BadgeUnlockRow({ badge, index, maxUnlocks }) {
  const unlockCount = Number(badge.unlock_count || 0);
  const width = Math.max(6, (unlockCount / maxUnlocks) * 100);
  const imageUrl = getImageUrl(badge.image);

  return (
    <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-green-50">
        {imageUrl ? (
          <div
            className="h-10 w-10 rounded-md bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
        ) : (
          <Trophy className="text-green-600" size={22} />
        )}
        <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-bold text-white">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-gray-800">
            {badge.name}
          </p>
          {badge.type && (
            <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-500 sm:inline">
              {badge.type.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          {nf.format(unlockCount)}
        </p>
        <p className="text-xs text-gray-500">users</p>
      </div>
    </div>
  );
}

function formatImpact(value) {
  const number = Number(value || 0);
  return nf.format(Number(number.toFixed(1)));
}
