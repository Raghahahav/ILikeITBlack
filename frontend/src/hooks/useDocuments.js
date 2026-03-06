import { useState, useEffect, useCallback } from 'react';
import { getDocuments, uploadDocument, deleteDocument } from '../services/api';

/**
 * Custom hook for managing documents
 */
export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const upload = useCallback(async (file) => {
    setUploadProgress(0);
    setError(null);
    try {
      const result = await uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });
      await fetchDocuments();
      setUploadProgress(null);
      return result;
    } catch (err) {
      setError(err.message);
      setUploadProgress(null);
      throw err;
    }
  }, [fetchDocuments]);

  const remove = useCallback(async (docId) => {
    setError(null);
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    documents,
    isLoading,
    uploadProgress,
    error,
    fetchDocuments,
    upload,
    remove,
    hasDocuments: documents.length > 0,
  };
};
