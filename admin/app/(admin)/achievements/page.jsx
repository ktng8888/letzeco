'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import toast from 'react-hot-toast';
import achievementService from '../../../services/achievementService';
import PageHeader from '../../../components/layout/PageHeader';
import DataTable from '../../../components/common/DataTable';
import ActionButtons from '../../../components/common/ActionButtons';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import ConfirmDelete from '../../../components/common/ConfirmDelete';
import Button from '../../../components/common/Button';

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  log: 'Log category',
  log_specific_action: 'Log action',
  reach_level: 'Reach level',
  maintain_streak: 'Streak',
  earn_total_xp: 'Total XP',
  save_co2: 'Save CO2',
  save_litre: 'Save water',
  save_kwh: 'Save energy',
  add_friends: 'Friends',
  complete_challenges: 'Solo challenges',
  complete_team_challenges: 'Team challenges',
};

const getGroupKey = (achievement) => [
  achievement.type || '',
  achievement.type === 'log' ? achievement.action_category_id || '' : '',
  achievement.type === 'log_specific_action' ? achievement.action_id || '' : '',
].join(':');

const buildGroups = (achievements) => {
  const map = new Map();

  achievements.forEach((achievement) => {
    const key = getGroupKey(achievement);
    if (!map.has(key)) {
      map.set(key, {
        ...achievement,
        id: achievement.id,
        group_key: key,
        achievements: [],
      });
    }
    map.get(key).achievements.push(achievement);
  });

  return Array.from(map.values()).map((group) => {
    const tiers = group.achievements
      .sort((a, b) => a.target_value - b.target_value);
    return {
      ...group,
      achievements: tiers,
      tier_count: tiers.length,
      target_values: tiers.map(a => a.target_value).join(', '),
      bonus_values: tiers.map(a => `+${a.bonus_xp} XP`).join(', '),
      first_target: tiers[0]?.target_value,
      last_target: tiers[tiers.length - 1]?.target_value,
    };
  });
};

export default function AchievementsPage() {
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await achievementService.getAll();
      const grouped = buildGroups(res.data);
      setAllData(grouped);
      setFiltered(grouped);
    } catch { toast.error('Failed to load.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    const q = search.toLowerCase();
    setFiltered(q
      ? allData.filter(a =>
          TYPE_LABELS[a.type]?.toLowerCase().includes(q) ||
          a.category_name?.toLowerCase().includes(q) ||
          a.action_name?.toLowerCase().includes(q) ||
          a.achievements.some(tier =>
            tier.name?.toLowerCase().includes(q) ||
            tier.badge_name?.toLowerCase().includes(q)
          )
        )
      : allData
    );
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setFiltered(allData);
    setPage(1);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        deleteItem.achievements.map(item => achievementService.delete(item.id))
      );
      toast.success('Achievement group deleted.');
      setDeleteItem(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsDeleting(false); }
  };

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE, page * PAGE_SIZE
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const columns = [
    {
      key: 'type', label: 'Achievement Type',
      render: (val, row) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-800">
            {TYPE_LABELS[row.type] || row.type?.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-gray-400">
            {row.tier_count} target tier{row.tier_count === 1 ? '' : 's'}
          </p>
        </div>
      )
    },
    {
      key: 'category_name', label: 'Category',
      render: (_, row) => row.type === 'log'
        ? row.category_name || '-'
        : '-'
    },
    {
      key: 'action_name', label: 'Action',
      render: (_, row) => row.type === 'log_specific_action'
        ? row.action_name || '-'
        : '-'
    },
    {
      key: 'achievements', label: 'Badges',
      render: (tiers) => (
        <div className="flex -space-x-2">
          {tiers.slice(0, 4).map((tier) => (
            <div key={tier.id}
              title={tier.badge_name}
              className="w-9 h-9 rounded-lg border border-white bg-gray-50
                overflow-hidden">
              {tier.badge_image ? (
              <img
                  src={getImageUrl(tier.badge_image)}
                  alt={tier.badge_name || 'Badge'}
                  className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={'/default.png'}
                  alt={tier.badge_name || 'Badge'}
                className="w-full h-full object-cover"
              />
              )}
            </div>
          ))}
          {tiers.length > 4 && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 border border-white
              text-xs font-semibold text-gray-500 flex items-center
              justify-center">
              +{tiers.length - 4}
            </div>
          )}
        </div>
      )
    },
    { key: 'target_values', label: 'Targets',
      render: (val) => val || '-' },
    { key: 'bonus_values', label: 'Bonus XP',
      render: (val) => (
        <span className="text-yellow-600 font-medium">{val}</span>
      ) },
    {
      key: 'id', label: 'Actions', width: '120px',
      render: (_, row) => (
        <ActionButtons
          onView={() => router.push(
            `/achievements/${row.id}?mode=view&group=${encodeURIComponent(row.group_key)}`
          )}
          onEdit={() => router.push(
            `/achievements/${row.id}?mode=edit&group=${encodeURIComponent(row.group_key)}`
          )}
          onDelete={() => setDeleteItem(row)}
        />
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Achievements & Badges Management"
        subtitle="Manage achievements and badges users can unlock"
        action={
          <Button onClick={() => router.push('/achievements/create')}>
            <Plus className="w-4 h-4" />Add Achievement
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              All Achievements ({filtered.length} Groups)
            </h3>
            <SearchBar value={search} onChange={setSearch}
              onSearch={handleSearch} onClear={handleClear}
              placeholder="Search by keyword" />
          </div>
        </div>
        <DataTable columns={columns} data={paginated}
          isLoading={isLoading}
          emptyMessage="No achievements found." />
        <div className="pb-4">
          <Pagination current={page} total={totalPages}
            onPageChange={setPage} />
        </div>
      </div>
      <ConfirmDelete isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem
          ? `${TYPE_LABELS[deleteItem.type] || deleteItem.type} group`
          : ''}
        isLoading={isDeleting} />
    </div>
  );
}
