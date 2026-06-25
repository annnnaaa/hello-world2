import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Trash2, FileText, Image, Film, File } from 'lucide-react';
import { useDocuments, useDocumentUrl, useDeleteDocument } from '../../hooks/useDocuments';
import { useState } from 'react';
import { format } from 'date-fns';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function DocumentDetailPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { data: documents } = useDocuments();
  const doc = documents?.find((d: any) => d.id === docId);
  const { data: signedUrl } = useDocumentUrl(doc?.file_path);
  const deleteDoc = useDeleteDocument();
  const [showDelete, setShowDelete] = useState(false);

  if (!doc) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Document not found</p>
        <button onClick={() => navigate('/filing')} className="text-indigo-400 text-sm mt-2">Go back</button>
      </div>
    );
  }

  const isImage = doc.mime_type.startsWith('image/');
  const Icon = isImage ? Image : doc.mime_type.startsWith('video/') ? Film :
    doc.mime_type.includes('pdf') ? FileText : File;

  const handleDelete = async () => {
    await deleteDoc.mutateAsync({ id: doc.id, filePath: doc.file_path });
    navigate('/filing');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white truncate flex-1">{doc.name}</h1>
        <button onClick={() => setShowDelete(true)} className="p-2 text-slate-400 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
        {isImage && signedUrl ? (
          <img src={signedUrl} alt={doc.name} className="max-w-full max-h-64 rounded-lg object-contain" />
        ) : (
          <Icon className="w-20 h-20 text-slate-500" />
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Type</span>
          <span className="text-white">{doc.mime_type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Size</span>
          <span className="text-white">{formatSize(doc.file_size)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Uploaded</span>
          <span className="text-white">{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Notes */}
      {doc.user_notes && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{doc.user_notes}</p>
        </div>
      )}

      {/* Download */}
      {signedUrl && (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
        >
          <Download className="w-5 h-5" /> Download
        </a>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDelete(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-white">Delete file?</h3>
            <p className="text-slate-400 text-sm">This will permanently delete {doc.name}.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
