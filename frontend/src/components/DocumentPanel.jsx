import { useState, useCallback } from 'react';
import { FileText, Trash2, X, Plus, Check } from 'lucide-react';
import clsx from 'clsx';

const DocumentPanel = ({ documents, isLoading, uploadProgress, onUpload, onDelete, isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'txt'].includes(ext);
    });
    for (const file of files) await onUpload(file);
  }, [onUpload]);

  const handleFileSelect = useCallback(async (e) => {
    for (const file of Array.from(e.target.files)) await onUpload(file);
    e.target.value = '';
  }, [onUpload]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try { await onDelete(id); } finally { setDeletingId(null); }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay (mobile) */}
      <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />

      {/* Panel */}
      <div className="fixed lg:relative right-0 top-0 h-full w-80 z-50
                      bg-surface-1 border-l border-border-subtle flex flex-col animate-slide-right">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Documents</span>
            {documents.length > 0 && (
              <span className="text-2xs text-text-muted bg-surface-3 px-1.5 py-0.5 rounded-md">
                {documents.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-3 text-text-faint hover:text-text-secondary transition-default">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Zone */}
        <div className="p-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
              'border border-dashed rounded-xl p-6 text-center transition-default cursor-pointer',
              isDragging ? 'border-accent bg-accent-subtle' : 'border-border hover:border-border-hover'
            )}
          >
            <input type="file" accept=".pdf,.txt" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center">
                <Plus className="w-4 h-4 text-text-muted" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary">Drop files or click to upload</p>
                <p className="text-2xs text-text-faint mt-0.5">PDF, TXT</p>
              </div>
            </label>
          </div>

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="text-2xs text-text-muted tabular-nums">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* RAG Active */}
        {documents.length > 0 && (
          <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-success/5 border border-status-success/10">
            <Check className="w-3.5 h-3.5 text-status-success" />
            <span className="text-2xs text-status-success">RAG active — documents will be searched</span>
          </div>
        )}

        {/* Document List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No documents yet</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-default">
                <div className="w-8 h-8 rounded-md bg-surface-3 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-text-faint" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{doc.filename}</p>
                  <p className="text-2xs text-text-faint">
                    {doc.chunk_count} chunks · {formatDate(doc.uploaded_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="p-1.5 rounded-md text-text-faint hover:text-status-error hover:bg-status-error/10
                             opacity-0 group-hover:opacity-100 transition-default"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentPanel;
