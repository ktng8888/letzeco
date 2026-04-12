'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import toast from 'react-hot-toast';
import userService from '../../../services/userService';
import PageHeader from '../../../components/layout/PageHeader';
import DataTable from '../../../components/common/DataTable';
import ActionButtons from '../../../components/common/ActionButtons';
import SearchBar from '../../../components/common/SearchBar';
import FilterSelect from '../../../components/common/FilterSelect';
import Pagination from '../../../components/common/Pagination';
import ConfirmDelete from '../../../components/common/ConfirmDelete';
import Button from '../../../components/common/Button';

const PAGE_SIZE = 10;

export default function UsersPage() {
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [joinedFilter, setJoinedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll();
      setAllData(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load users.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    let result = [...allData];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.id).includes(q)
      );
    }
    if (joinedFilter !== 'all') {
      const now = new Date();
      result = result.filter(u => {
        if (!u.created_at) return false;
        const d = new Date(u.created_at);
        if (joinedFilter === 'this_month') {
          return d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
        }
        if (joinedFilter === 'this_year') {
          return d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }
    setFiltered(result);
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setJoinedFilter('all');
    setFiltered(allData);
    setPage(1);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await userService.delete(deleteItem.id);
      toast.success('User deleted.');
      setDeleteItem(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.');
    } finally { setIsDeleting(false); }
  };

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const columns = [
    {
      key: 'username', label: 'User',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center
            justify-center text-blue-600 font-bold text-sm shrink-0">
            {row.profile_image ? (
              <img
                src={getImageUrl(row.profile_image)}
                alt={val}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center
                bg-blue-100 text-blue-600 font-bold text-sm rounded-full">
                {val?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{val}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'level', label: 'Level',
      render: (val) => <span className="font-medium">Lv. {val}</span> },
    { key: 'total_xp', label: 'Total XP',
      render: (val) => <span className="text-yellow-600 font-medium">{val} XP</span> },
    { key: 'streak', label: 'Streak',
      render: (val) => <span>🔥 {val} days</span> },
    { key: 'created_at', label: 'Joined',
      render: (val) => val ? formatDate(val) : '-' },
    {
      key: 'id', label: 'Actions', width: '120px',
      render: (_, row) => (
        <ActionButtons
          onView={() => router.push(`/users/${row.id}?mode=view`)}
          onEdit={() => router.push(`/users/${row.id}?mode=edit`)}
          onDelete={() => setDeleteItem(row)}
        />
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users Management"
        subtitle="Manage all registered users"
        action={
          <Button onClick={() => router.push('/users/create')}>
            <Plus className="w-4 h-4" />Create User
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Table Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              All Users ({filtered.length} Users)
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
              label="Joined Date"
              value={joinedFilter}
              onChange={setJoinedFilter}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'this_month', label: 'This Month' },
                { value: 'this_year', label: 'This Year' },
              ]}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyMessage="No users found."
        />

        <div className="pb-4">
          <Pagination
            current={page}
            total={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmDelete
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.username}
        isLoading={isDeleting}
      />
    </div>
  );
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}