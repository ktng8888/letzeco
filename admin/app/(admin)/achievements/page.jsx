'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
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
      setAllData(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    const q = search.toLowerCase();
    setFiltered(q
      ? allData.filter(a =>
          a.name?.toLowerCase().includes(q) ||
          a.badge_name?.toLowerCase().includes(q)
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
      await achievementService.delete(deleteItem.id);
      toast.success('Achievement deleted.');
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
      key: 'name', label: 'Achievement',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-800">{val}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {row.badge_name}
          </p>
        </div>
      )
    },
    { key: 'type', label: 'Type',
      render: (val) => (
        <span className="text-xs bg-purple-100 text-purple-700
          px-2 py-1 rounded-full font-medium capitalize">
          {val?.replace(/_/g, ' ')}
        </span>
      )
    },
    { key: 'target_value', label: 'Target',
      render: (val) => val || '-' },
    { key: 'bonus_xp', label: 'Bonus XP',
      render: (val) => (
        <span className="text-yellow-600 font-medium">+{val} XP</span>
      )
    },
    { key: 'category_name', label: 'Category',
      render: (val) => val || 'Any' },
    {
      key: 'id', label: 'Actions', width: '120px',
      render: (_, row) => (
        <ActionButtons
          onView={() => router.push(`/achievements/${row.id}?mode=view`)}
          onEdit={() => router.push(`/achievements/${row.id}?mode=edit`)}
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
              All Achievements ({filtered.length} Achievements)
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
        itemName={deleteItem?.name}
        isLoading={isDeleting} />
    </div>
  );
}