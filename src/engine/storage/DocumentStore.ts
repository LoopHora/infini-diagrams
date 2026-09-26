import { DiagramDocument, DocumentRevision, PresentationSettings } from '../../types';
import { DIAGRAM_TEMPLATES } from '../../data/templates';

const DB_NAME = 'InfiniDiagramsDB';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const REVISIONS_STORE = 'revisions';
const ACTIVE_DOC_KEY = 'infini_active_document_id';
const MAX_REVISIONS_PER_DOC = 30;

export const DEFAULT_PRESENTATION: PresentationSettings = {
  theme: 'default',
  backgroundType: 'transparent',
  customBackgroundColor: '#ffffff',
  padding: 24,
};

export class DocumentStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DOCS_STORE)) {
          const store = db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(REVISIONS_STORE)) {
          const revStore = db.createObjectStore(REVISIONS_STORE, { keyPath: 'id' });
          revStore.createIndex('documentId', 'documentId', { unique: false });
          revStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async getAllDocuments(): Promise<DiagramDocument[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DOCS_STORE, 'readonly');
      const store = tx.objectStore(DOCS_STORE);
      const request = store.getAll();

      request.onsuccess = async () => {
        let docs = request.result as DiagramDocument[];
        if (!docs || docs.length === 0) {
          // Initialize with default starter diagram
          const starter = await this.createInitialDocument();
          docs = [starter];
        } else {
          // Sort by updatedAt descending
          docs.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        resolve(docs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getDocument(id: string): Promise<DiagramDocument | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DOCS_STORE, 'readonly');
      const store = tx.objectStore(DOCS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveDocument(doc: DiagramDocument): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([DOCS_STORE, REVISIONS_STORE], 'readwrite');
      const store = tx.objectStore(DOCS_STORE);
      const updatedDoc = { ...doc, updatedAt: Date.now() };
      const request = store.put(updatedDoc);

      request.onsuccess = () => {
        // Automatically save snapshot into revision history
        this.appendRevision(tx, doc.id, doc.source, doc.title);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createDocument(title = 'system-architecture', source?: string): Promise<DiagramDocument> {
    const starterTemplate = DIAGRAM_TEMPLATES[0];
    const newDoc: DiagramDocument = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      source: source || starterTemplate.source,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      presentation: { ...DEFAULT_PRESENTATION },
    };

    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DOCS_STORE, 'readwrite');
      const store = tx.objectStore(DOCS_STORE);
      const req = store.add(newDoc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    this.setActiveDocumentId(newDoc.id);
    return newDoc;
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([DOCS_STORE, REVISIONS_STORE], 'readwrite');
      tx.objectStore(DOCS_STORE).delete(id);

      // Clean up revisions for this doc
      const revStore = tx.objectStore(REVISIONS_STORE);
      const index = revStore.index('documentId');
      const req = index.openCursor(IDBKeyRange.only(id));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getRevisions(documentId: string): Promise<DocumentRevision[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REVISIONS_STORE, 'readonly');
      const store = tx.objectStore(REVISIONS_STORE);
      const index = store.index('documentId');
      const req = index.getAll(IDBKeyRange.only(documentId));

      req.onsuccess = () => {
        const list = (req.result as DocumentRevision[]) || [];
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  private appendRevision(tx: IDBTransaction, documentId: string, source: string, title: string) {
    const revStore = tx.objectStore(REVISIONS_STORE);
    const revision: DocumentRevision = {
      id: `rev-${documentId}-${Date.now()}`,
      documentId,
      timestamp: Date.now(),
      source,
      title,
    };
    revStore.add(revision);

    // Prune revisions if exceeding MAX_REVISIONS_PER_DOC
    const index = revStore.index('documentId');
    const getReq = index.getAll(IDBKeyRange.only(documentId));
    getReq.onsuccess = () => {
      const revs = (getReq.result as DocumentRevision[]) || [];
      if (revs.length > MAX_REVISIONS_PER_DOC) {
        revs.sort((a, b) => a.timestamp - b.timestamp); // oldest first
        const toDeleteCount = revs.length - MAX_REVISIONS_PER_DOC;
        for (let i = 0; i < toDeleteCount; i++) {
          revStore.delete(revs[i].id);
        }
      }
    };
  }

  getActiveDocumentId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_DOC_KEY);
  }

  setActiveDocumentId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_DOC_KEY, id);
  }

  async clearRevisions(documentId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REVISIONS_STORE, 'readwrite');
      const revStore = tx.objectStore(REVISIONS_STORE);
      const index = revStore.index('documentId');
      const req = index.openCursor(IDBKeyRange.only(documentId));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([DOCS_STORE, REVISIONS_STORE], 'readwrite');
      tx.objectStore(DOCS_STORE).clear();
      tx.objectStore(REVISIONS_STORE).clear();
      tx.oncomplete = () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACTIVE_DOC_KEY);
        }
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  private async createInitialDocument(): Promise<DiagramDocument> {
    const starterTemplate = DIAGRAM_TEMPLATES[0];
    const initialDoc: DiagramDocument = {
      id: 'doc-default-starter',
      title: 'microservices-architecture',
      source: starterTemplate.source,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      presentation: { ...DEFAULT_PRESENTATION },
    };

    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DOCS_STORE, 'readwrite');
      tx.objectStore(DOCS_STORE).add(initialDoc);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    this.setActiveDocumentId(initialDoc.id);
    return initialDoc;
  }
}

export const documentStore = new DocumentStore();
