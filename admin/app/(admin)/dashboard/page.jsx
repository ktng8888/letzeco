'use client';
import { useEffect, useState } from 'react';
import dashboardService from '../../../services/dashboardService';
import PageHeader from '../../../components/layout/PageHeader';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  const impact = data?.environmental_impact;
  const maxLogs = data?.top_actions?.[0]?.log_count || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle={`Welcome back, ${data ? 'Admin' : ''}! You can view the status of the platform here.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={data?.total_users || 0} label="Total Users" />
        <StatCard value={data?.total_admins || 0} label="Admins" />
        <StatCard value={data?.total_categories || 0} label="Eco Action Categories" />
        <StatCard value={data?.total_actions_available || 0} label="Eco Actions" />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Environmental Impact */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Total Environmental Impact Summary
            </h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1
              rounded-full">All Time</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <ImpactBox
              icon="🌿"
              iconBg="bg-green-50"
              value={parseFloat(impact?.total_co2 || 0).toFixed(1)}
              unit="Kg CO₂ Saved"
            />
            <ImpactBox
              icon="💧"
              iconBg="bg-blue-50"
              value={parseFloat(impact?.total_litre || 0).toFixed(1)}
              unit="L Water Saved"
            />
            <ImpactBox
              icon="⚡"
              iconBg="bg-yellow-50"
              value={parseFloat(impact?.total_kwh || 0).toFixed(1)}
              unit="kWh Energy Saved"
            />
          </div>
        </div>

        {/* Top 10 Popular Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Top 10 Popular Eco Friendly Actions
            </h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1
              rounded-full">All Time</span>
          </div>
          <div className="space-y-2.5">
            {data?.top_actions?.map((action, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border
                  flex items-center justify-center text-xs font-bold
                  text-gray-500 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {action.name}
                  </p>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(action.log_count / maxLogs) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500 shrink-0">
                  {action.log_count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function ImpactBox({ icon, iconBg, value, unit }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 ${iconBg} rounded-xl
        flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 text-center">{unit}</p>
    </div>
  );
}