import { Eye, Pencil, Trash2 } from 'lucide-react';

export default function ActionButtons({ onView, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <button onClick={onView}
          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600
            rounded-lg transition cursor-pointer"
          title="View">
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button onClick={onEdit}
          className="p-2 bg-green-50 hover:bg-green-100 text-green-600
            rounded-lg transition cursor-pointer"
          title="Edit">
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete}
          className="p-2 bg-red-50 hover:bg-red-100 text-red-500
            rounded-lg transition cursor-pointer"
          title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}