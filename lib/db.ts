// Removed firebase imports to fix missing exported member errors.
// Operating in offline/local storage mode.

import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionStatus: 'connecting' | 'online' | 'error' | 'offline' = 'connecting';

export const dbService = {
  getStatus(): string {
    return connectionStatus;
  },

  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      connectionStatus = 'online';
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        connectionStatus = 'offline';
        console.error("Please check your Firebase configuration.");
      } else if (error instanceof Error && error.message.includes('permission')) {
        // Just means we can't read 'test/connection', which is expected, but network is fine.
        connectionStatus = 'online';
      } else {
        connectionStatus = 'error';
      }
    }
  },

  async getCollection<T = any>(colName: string): Promise<T[]> {
    try {
      const snap = await getDocs(collection(db, colName));
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as unknown as T));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, colName);
      return [];
    }
  },

  subscribe<T = any>(colName: string, callback: (data: T[]) => void) {
    const q = collection(db, colName);
    const unsub = onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as T)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, colName);
    });
    return unsub;
  },

  async saveItem(colName: string, item: any) {
    const id = item.id || Date.now().toString();
    try {
      await setDoc(doc(db, colName, id), { ...item, id });
      return id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${colName}/${id}`);
      return id;
    }
  },
  
  // Aliases for saveItem
  async addDocument(colName: string, item: any) {
    return this.saveItem(colName, item);
  },
  async updateDocument(colName: string, id: string, item: any) {
    return this.saveItem(colName, { ...item, id });
  },

  async deleteItem(colName: string, id: string) {
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${colName}/${id}`);
    }
  },
  
  // Alias for deleteItem
  async deleteDocument(colName: string, id: string) {
    return this.deleteItem(colName, id);
  }
};

dbService.testConnection();