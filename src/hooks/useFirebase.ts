import { useState, useEffect, useCallback } from 'react';
import { 
  listDocuments, 
  getDocument, 
  saveDocument, 
  deleteDocument, 
  addDocumentAutoId 
} from '../services/firebase/services';
import { isFirebaseConfigured, db } from '../services/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

// Generic Collection Hook
export function useCollection<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await listDocuments<T>(collectionName);
      setData(docs);
      setError(null);
    } catch (err: any) {
      setError(err.message || `Failed to fetch '${collectionName}' collection.`);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  // Use live snapshot if Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      setLoading(true);
      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const list: T[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
          });
          setData(list);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`[onSnapshot Error in '${collectionName}']:`, err);
          setError(err.message || 'Error syncing data with backend.');
          setLoading(false);
        }
      );
      return unsubscribe;
    } else {
      // LocalStorage mode - initial load
      fetchData();

      // Listen for local updates on the same tab
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === `vaw_lyne_db_${collectionName}`) {
          fetchData();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [collectionName, fetchData]);

  const save = async (docData: T) => {
    try {
      await saveDocument(collectionName, docData);
      if (!isFirebaseConfigured) {
        await fetchData(); // force reload mock state
      }
    } catch (err: any) {
      console.error(`[saveDocument Error in '${collectionName}']:`, err);
      throw err;
    }
  };

  const createWithAutoId = async (docData: Omit<T, 'id'>) => {
    try {
      const generatedId = await addDocumentAutoId(collectionName, docData);
      if (!isFirebaseConfigured) {
        await fetchData(); // force reload mock state
      }
      return generatedId;
    } catch (err: any) {
      console.error(`[addDocumentAutoId Error in '${collectionName}']:`, err);
      throw err;
    }
  };

  const remove = async (docId: string) => {
    try {
      await deleteDocument(collectionName, docId);
      if (!isFirebaseConfigured) {
        await fetchData(); // force reload mock state
      }
    } catch (err: any) {
      console.error(`[deleteDocument Error in '${collectionName}']:`, err);
      throw err;
    }
  };

  return { data, loading, error, reload: fetchData, save, createWithAutoId, remove };
}

// Generic Document Hook
export function useDocument<T extends { id: string }>(collectionName: string, docId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoc = useCallback(async () => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const docData = await getDocument<T>(collectionName, docId);
      setData(docData);
      setError(null);
    } catch (err: any) {
      setError(err.message || `Failed to fetch '${collectionName}' doc with ID '${docId}'.`);
    } finally {
      setLoading(false);
    }
  }, [collectionName, docId]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const save = async (docData: T) => {
    try {
      await saveDocument(collectionName, docData);
      setData(docData);
    } catch (err: any) {
      console.error(`[saveDocument Error in doc '${collectionName}/${docId}']:`, err);
      throw err;
    }
  };

  return { data, loading, error, reload: fetchDoc, save };
}
