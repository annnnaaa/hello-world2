import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Folder, Upload, File, FileText, Image, Film, FolderPlus } from 'lucide-react';
import { useFolders, useCreateFolder } from '../../hooks/useFolders';
import { useDocuments, useUploadDocument } from '../../hooks/useDocuments';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Film;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  return File;
}

export default function FolderView() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { flatFolders } = useFolders();
  const { data: documents } = useDocuments(folderId);
  const createFolder = useCreateFolder();
  const uploadDoc = useUploadDocument();
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const currentFolder = flatFolders.find((f) => f.id === folderId);
  const subFolders = flatFolders.filter((f) => f.parent_id === folderId);

  const breadcrumb: { id: string; name: string }[] = [];
  let cur = currentFolder;
  while (cur) {
    breadcrumb.unshift({ id: cur.id, name: cur.name });
    cur = flatFolders.find((f) => f.id === cur!.parent_id);
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder.mutateAsync({ name: newFolderName.trim(), parent_id: folderId });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      await uploadDoc.mutateAsync({ file, folderId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white truncate">{currentFolder?.name || 'Folder'}</h1>
        <div className="flex-1" />
        <button onClick={() => setShowNewFolder(true)} className="p-2 text-slate-400 hover:text-white">
          <FolderPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs overflow-x-auto">
        <button onClick={() => navigate('/filing')} className="text-indigo-400 shrink-0">Home</button>
        {breadcrumb.map((b) => (
          <span key={b.id} className="flex items-center gap-1 shrink-0">
            <span className="text-slate-600">/</span>
            <button onClick={() => navigate(`/filing/folder/${b.id}`)} className="text-slate-400 hover:text-white">
              {b.name}
            </button>
          </span>
        ))}
      </div>

      {/* Sub-folders */}
      {subFolders.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {subFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => navigate(`/filing/folder/${f.id}`)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 text-left"
            >
              <Folder className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-white text-sm font-medium truncate">{f.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Documents */}
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {documents.map((doc: any) => {
            const Icon = fileIcon(doc.mime_type);
            return (
              <button
                key={doc.id}
                onClick={() => navigate(`/filing/doc/${doc.id}`)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-left"
              >
                <Icon className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-white text-sm font-medium truncate">{doc.name}</p>
                <p className="text-slate-500 text-xs mt-1">{formatSize(doc.file_size)}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <File className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No files in this folder</p>
        </div>
      )}

      {/* Upload */}
      <label className="block border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors">
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">{uploadDoc.isPending ? 'Uploading...' : 'Tap to upload'}</p>
        <input type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </label>

      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNewFolder(false)} />
          <div className="relative w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">New Sub-folder</h3>
            <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" autoFocus
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <button onClick={handleCreateFolder} disabled={createFolder.isPending || !newFolderName.trim()}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
              {createFolder.isPending ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
