'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import toast from 'react-hot-toast';
import categoryService from '../../../services/categoryService';
import PageHeader from '../../../components/layout/PageHeader';
import DataTable from '../../../components/common/DataTable';
import ActionButtons from '../../../components/common/ActionButtons';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import ConfirmDelete from '../../../components/common/ConfirmDelete';
import Button from '../../../components/common/Button';

const PAGE_SIZE = 10;

export default function CategoriesPage() {
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
      const res = await categoryService.getAll();
      setAllData(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load categories.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    const q = search.toLowerCase();
    const result = q
      ? allData.filter(c => c.name?.toLowerCase().includes(q))
      : allData;
    setFiltered(result);
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
      await categoryService.delete(deleteItem.id);
      toast.success('Category deleted.');
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
      key: 'name', label: 'Category',
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
          <span className="font-medium text-gray-800">{val}</span>
        </div>
      )
    },
    { key: 'action_count', label: 'Actions',
      render: (val) => `${val || 0} Actions` },
    { key: 'created_at', label: 'Created at',
      render: (val) => val ? formatDate(val) : '-' },
    {
      key: 'id', label: 'Actions', width: '120px',
      render: (_, row) => (
        <ActionButtons
          onView={() => router.push(`/categories/${row.id}?mode=view`)}
          onEdit={() => router.push(`/categories/${row.id}?mode=edit`)}
          onDelete={() => setDeleteItem(row)}
        />
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Eco Action Categories Management"
        subtitle="Manage categories for eco-friendly actions"
        action={
          <Button onClick={() => router.push('/categories/create')}>
            <Plus className="w-4 h-4" />Create Category
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              All Categories ({filtered.length} Categories)
            </h3>
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onClear={handleClear}
              placeholder="Search by keyword"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyMessage="No categories found."
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

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}