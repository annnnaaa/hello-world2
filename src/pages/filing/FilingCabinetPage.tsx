import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FolderPlus, Upload, Search, FileText, Image, Film, File, X } from 'lucide-react';
import { useFolders, useCreateFolder } from '../../hooks/useFolders';
import { useDocuments, useUploadDocument } from '../../hooks/useDocuments';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Film;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText;
  return File;
}

export default function FilingCabinetPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { folderTree } = useFolders();
  const { data: documents, isLoading } = useDocuments(null);
  const createFolder = useCreateFolder();
  const uploadDoc = useUploadDocument();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const { data: searchResults } = useDocuments(undefined, searchQuery || undefined);
  const displayDocs = searchQuery ? searchResults : documents;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder.mutateAsync({ name: newFolderName.trim() });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      await uploadDoc.mutateAsync({ file, folderId: null });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Filing Cabinet</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-slate-400 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setShowNewFolder(true)} className="p-2 text-slate-400 hover:text-white">
            <FolderPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            autoFocus
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Folders */}
      {!searchQuery && folderTree.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Folders</h2>
          <div className="grid grid-cols-2 gap-2">
            {folderTree.map((folder) => (
              <button
                key={folder.id}
                onClick={() => navigate(`/filing/folder/${folder.id}`)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 text-left"
              >
                <Folder className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{folder.name}</p>
                  {folder.children.length > 0 && (
                    <p className="text-slate-500 text-xs">{folder.children.length} sub</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {searchQuery ? 'Search results' : 'Root files'}
        </h2>
        {displayDocs && displayDocs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {displayDocs.map((doc: any) => {
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
          !isLoading && (
            <div className="text-center py-8">
              <File className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">{searchQuery ? 'No files found' : 'No files yet'}</p>
            </div>
          )
        )}
      </section>

      {/* Upload Zone */}
      <label className="block border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors">
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">
          {uploadDoc.isPending ? 'Uploading...' : 'Tap to upload files'}
        </p>
        <input type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </label>

      {/* New Folder Sheet */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNewFolder(false)} />
          <div className="relative w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              onClick={handleCreateFolder}
              disabled={createFolder.isPending || !newFolderName.trim()}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {createFolder.isPending ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
