'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import toast from 'react-hot-toast';
import actionService from '../../../services/actionService';
import categoryService from '../../../services/categoryService';
import PageHeader from '../../../components/layout/PageHeader';
import DataTable from '../../../components/common/DataTable';
import ActionButtons from '../../../components/common/ActionButtons';
import SearchBar from '../../../components/common/SearchBar';
import FilterSelect from '../../../components/common/FilterSelect';
import Pagination from '../../../components/common/Pagination';
import ConfirmDelete from '../../../components/common/ConfirmDelete';
import Button from '../../../components/common/Button';

const PAGE_SIZE = 10;

export default function ActionsPage() {
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [actRes, catRes] = await Promise.all([
        actionService.getAll(),
        categoryService.getAll(),
      ]);
      setAllData(actRes.data);
      setFiltered(actRes.data);
      setCategories(catRes.data);
    } catch { toast.error('Failed to load.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    let result = [...allData];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.name?.toLowerCase().includes(q)
      );
    }
    if (catFilter !== 'all') {
      result = result.filter(
        a => String(a.action_category_id) === catFilter
      );
    }
    setFiltered(result);
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setCatFilter('all');
    setFiltered(allData);
    setPage(1);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await actionService.delete(deleteItem.id);
      toast.success('Action deleted.');
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

  const catOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: String(c.id), label: c.name }))
  ];

  const columns = [
    {
      key: 'name', label: 'Action',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: row.colour || '#EDEDED' }}
          >
            {row.image ? (
              <img
                src={getImageUrl(row.image)}
                alt={val}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={'/default.png'}
                alt={val}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{val}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {row.category_name}
            </p>
          </div>
        </div>
      )
    },
    { key: 'xp_reward', label: 'XP Reward',
      render: (val) => (
        <span className="text-yellow-600 font-medium">
          {val} XP
        </span>
      )
    },
    { key: 'time_limit', label: 'Time Limit',
      render: (val) => val ? formatTimeLimit(val) : 'No limit' },
    { key: 'co2_saved', label: 'CO₂ Saved',
      render: (val) => val ? `${val} kg` : '-' },
    {
      key: 'id', label: 'Actions', width: '120px',
      render: (_, row) => (
        <ActionButtons
          onView={() => router.push(`/actions/${row.id}?mode=view`)}
          onEdit={() => router.push(`/actions/${row.id}?mode=edit`)}
          onDelete={() => setDeleteItem(row)}
        />
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Eco Actions Management"
        subtitle="Manage all eco-friendly actions"
        action={
          <Button onClick={() => router.push('/actions/create')}>
            <Plus className="w-4 h-4" />Create Action
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              All Actions ({filtered.length} Actions)
            </h3>
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onClear={handleClear}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Filter:</span>
            <FilterSelect
              label="Category"
              value={catFilter}
              onChange={setCatFilter}
              options={catOptions}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyMessage="No actions found."
        />
        <div className="pb-4">
          <Pagination current={page} total={totalPages}
            onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDelete
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}

function formatTimeLimit(t) {
  if (!t) return 'No limit';
  if (typeof t === 'object') {
    const h = t.hours || 0;
    const m = t.minutes || 0;
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    if (m > 0) return `${m} min`;
  }
  if (typeof t === 'string') {
    const [h, m] = t.split(':').map(Number);
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    if (m > 0) return `${m} min`;
  }
  return t;
}