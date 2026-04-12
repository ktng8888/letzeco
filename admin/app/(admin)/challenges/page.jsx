'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import challengeService from '../../../services/challengeService';
import PageHeader from '../../../components/layout/PageHeader';
import DataTable from '../../../components/common/DataTable';
import ActionButtons from '../../../components/common/ActionButtons';
import SearchBar from '../../../components/common/SearchBar';
import FilterSelect from '../../../components/common/FilterSelect';
import Pagination from '../../../components/common/Pagination';
import ConfirmDelete from '../../../components/common/ConfirmDelete';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const PAGE_SIZE = 10;

export default function ChallengesPage() {
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await challengeService.getAll();
      setAllData(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    let result = [...allData];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all')
      result = result.filter(c => c.type === typeFilter);
    if (statusFilter !== 'all')
      result = result.filter(c => c.status === statusFilter);
    setFiltered(result);
    setPage(1);
  };

  const handleClear = () => {
    setSearch(''); setTypeFilter('all'); setStatusFilter('all');
    setFiltered(allData); setPage(1);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await challengeService.delete(deleteItem.id);
      toast.success('Challenge deleted.');
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
      key: 'name', label: 'Challenge',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100
            flex items-center justify-center text-lg">
            🏆
          </div>
          <span className="font-medium text-gray-800">{val}</span>
        </div>
      )
    },
    { key: 'type', label: 'Type',
      render: (val) => (
        <Badge
          text={val === 'team' ? 'Team' : 'Solo'}
          color={val === 'team' ? 'blue' : 'green'}
        />
      )
    },
    { key: 'status', label: 'Status',
      render: (val) => (
        <Badge
          text={val?.charAt(0).toUpperCase() + val?.slice(1)}
          color={val === 'active' ? 'green' : 'gray'}
        />
      )
    },
    { key: 'start_date', label: 'Dates',
      render: (val, row) => (
        <span className="text-sm text-gray-600">
          {formatShortDate(val)} to {formatShortDate(row.end_date)}
        </span>
      )
    },
    { key: 'id', label: 'Actions', width: '120px',
      render: (_, row) => (
        <ActionButtons
          onView={() => router.push(`/challenges/${row.id}?mode=view`)}
          onEdit={() => router.push(`/challenges/${row.id}?mode=edit`)}
          onDelete={() => setDeleteItem(row)}
        />
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Challenge Management"
        subtitle="Manage challenges users can participate"
        action={
          <Button onClick={() => router.push('/challenges/create')}>
            <Plus className="w-4 h-4" />Create Challenge
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              All Challenges ({filtered.length} Challenges)
            </h3>
            <SearchBar value={search} onChange={setSearch}
              onSearch={handleSearch} onClear={handleClear} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Filter:</span>
            <FilterSelect label="Types" value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'solo', label: 'Solo' },
                { value: 'team', label: 'Team' },
              ]}
            />
            <FilterSelect label="Status" value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
        <DataTable columns={columns} data={paginated}
          isLoading={isLoading} emptyMessage="No challenges found." />
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

function formatShortDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}