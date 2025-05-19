import { openDB, DBSchema, IDBPDatabase } from 'idb';
// Import the canonical schema definition and specific types
import type { MediatorMateDBSchema, Matter, Note, Contact, Document, Task, CaseFileMetadata } from '@/types/models';

// --- Database Configuration ---
const DATABASE_NAME = 'MediatorMateDB';
// Increment version if schema changes require it (like adding caseFiles store)
const DATABASE_VERSION = 4; // Incremented version due to adding 'meetings' store

// --- Database Connection ---
let dbPromise: Promise<IDBPDatabase<MediatorMateDBSchema>> | null = null;

const getDb = (): Promise<IDBPDatabase<MediatorMateDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<MediatorMateDBSchema>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('matters')) {
          const matterStore = db.createObjectStore('matters', { keyPath: 'id' }); // Assuming 'id' is the key
          matterStore.createIndex('by-status', 'status');
          console.log("Created 'matters' object store.");
        }
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' }); // Assuming 'id' is the key
          noteStore.createIndex('by-caseFileNumber', 'caseFileNumber');
          console.log("Created 'notes' object store.");
        }
        if (!db.objectStoreNames.contains('contacts')) {
            const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
            contactStore.createIndex('by-name', 'name'); // Index by the actual 'name' field
            console.log("Created 'contacts' object store.");
        }
        if (!db.objectStoreNames.contains('documents')) {
            const docStore = db.createObjectStore('documents', { keyPath: 'id' });
            docStore.createIndex('by-caseId', 'caseId');
            docStore.createIndex('by-type', 'type');
            console.log("Created 'documents' object store.");
        }
         if (!db.objectStoreNames.contains('tasks')) {
            const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
            taskStore.createIndex('by-status', 'status');
            taskStore.createIndex('by-dueDate', 'dueDate');
            console.log("Created 'tasks' object store.");
        }
        // Add the new caseFiles store if it doesn't exist (added in v2)
        if (!db.objectStoreNames.contains('caseFiles')) {
            const caseFileStore = db.createObjectStore('caseFiles', { keyPath: 'id' });
            caseFileStore.createIndex('by-caseId', 'caseId'); // Index by case ID
            caseFileStore.createIndex('by-name', 'name'); // Index by file/folder name
            // Compound index for parent lookup within a case
            caseFileStore.createIndex('by-parent', ['caseId', 'parentId']);
            console.log("Created 'caseFiles' object store with updated indexes.");
        }
        if (!db.objectStoreNames.contains('timeline')) {
          const timelineStore = db.createObjectStore('timeline', { keyPath: 'id' });
          timelineStore.createIndex('by-caseId', 'caseId');
          timelineStore.createIndex('by-date', 'date');
          console.log("Created 'timeline' object store.");
        }

        // Add the new meetings store if it doesn't exist (added in v4)
        if (!db.objectStoreNames.contains('meetings')) {
          const meetingsStore = db.createObjectStore('meetings', { keyPath: 'id' });
          meetingsStore.createIndex('by-caseId', 'caseId');
          meetingsStore.createIndex('by-date', 'date');
          console.log("Created 'meetings' object store.");
        }

        // Handle future migrations based on oldVersion and newVersion
        // Example:
        // if (oldVersion < 2) {
        //   // Perform migration steps for version 2
        //   const store = transaction.objectStore('someStore');
        //   store.createIndex('newIndex', 'newProperty');
        // }
      },
      blocked() {
        console.error('IndexedDB blocked. Close other tabs using the database.');
        // Potentially show a user notification
      },
      blocking() {
        console.warn('IndexedDB blocking. Database upgrade needed but blocked.');
        // Potentially show a user notification
      },
      terminated() {
        console.error('IndexedDB connection terminated unexpectedly.');
        dbPromise = null; // Reset promise to allow reconnection attempt
      },
    });
  }
  return dbPromise;
};

// --- Type alias for store names ---
type StoreNameUnion = "matters" | "notes" | "contacts" | "documents" | "tasks" | "caseFiles";

// --- Generic CRUD Operations ---

/**
 * Adds an item to a specified object store.
 * @param storeName - The name of the object store.
 * @param item - The item to add.
 * @returns The key of the added item.
 */
export const addItem = async <StoreName extends keyof MediatorMateDBSchema>(
  storeName: StoreName,
  item: MediatorMateDBSchema[StoreName]['value']
): Promise<IDBValidKey> => {
  try {
    const db = await getDb();
    // Assert storeName type for idb method
    // No assertion needed now as StoreName correctly refers to the imported schema keys
    return await db.add(storeName as StoreNameUnion, item);
  } catch (error) {
    console.error(`Error adding item to ${storeName}:`, error);
    throw new Error(`Failed to add item to ${storeName}`); // Re-throw for handling upstream
  }
};

/**
 * Retrieves an item by its key from a specified object store.
 * @param storeName - The name of the object store.
 * @param key - The key of the item to retrieve.
 * @returns The retrieved item, or undefined if not found.
 */
export const getItem = async <StoreName extends keyof MediatorMateDBSchema>(
  storeName: StoreName,
  key: string // Keys are strings in our schema
): Promise<MediatorMateDBSchema[StoreName]['value'] | undefined> => {
  try {
    const db = await getDb();
    // Assert storeName type for idb method
    return await db.get(storeName as StoreNameUnion, key);
  } catch (error) {
    console.error(`Error getting item with key ${key} from ${storeName}:`, error);
    throw new Error(`Failed to get item from ${storeName}`);
  }
};

/**
 * Retrieves all items from a specified object store.
 * @param storeName - The name of the object store.
 * @returns An array of all items in the store.
 */
export const getAllItems = async <StoreName extends keyof MediatorMateDBSchema>(
  storeName: StoreName
): Promise<MediatorMateDBSchema[StoreName]['value'][]> => {
  try {
    const db = await getDb();
    // Assert storeName type for idb method
    return await db.getAll(storeName as StoreNameUnion);
  } catch (error) {
    console.error(`Error getting all items from ${storeName}:`, error);
    throw new Error(`Failed to get all items from ${storeName}`);
  }
};

/**
 * Retrieves items from a specified object store using an index.
 * @param storeName - The name of the object store.
 * @param indexName - The name of the index to query.
 * @param query - The value to query the index with.
 * @returns An array of matching items.
 */
export const getItemsByIndex = async <
    StoreName extends keyof MediatorMateDBSchema,
    IndexName extends keyof MediatorMateDBSchema[StoreName]['indexes']
>(
  storeName: StoreName,
  indexName: IndexName,
  query: IDBValidKey | IDBKeyRange
): Promise<MediatorMateDBSchema[StoreName]['value'][]> => {
  try {
    const db = await getDb();
    // Assert storeName type for idb method
    // @ts-ignore - TS struggles to reconcile the generic IndexName type with the specific storeName here,
    // but the generic constraints ensure this is safe.
    return await db.getAllFromIndex(storeName as StoreNameUnion, indexName, query);
  } catch (error) {
    console.error(`Error getting items from index ${String(indexName)} in ${storeName}:`, error);
    throw new Error(`Failed to get items by index from ${storeName}`);
  }
};


/**
 * Updates an existing item or adds it if it doesn't exist in a specified object store.
 * @param storeName - The name of the object store.
 * @param item - The item to update or add.
 * @returns The key of the updated/added item.
 */
export const putItem = async <StoreName extends keyof MediatorMateDBSchema>(
  storeName: StoreName,
  item: MediatorMateDBSchema[StoreName]['value']
): Promise<IDBValidKey> => {
  try {
    const db = await getDb();
    // Assert storeName type for idb method
    return await db.put(storeName as StoreNameUnion, item);
  } catch (error) {
    console.error(`Error putting item into ${storeName}:`, error);
    throw new Error(`Failed to put item into ${storeName}`);
  }
};

/**
 * Deletes an item by its key from a specified object store.
 * @param storeName - The name of the object store.
 * @param key - The key of the item to delete.
 */
export const deleteItem = async <StoreName extends keyof MediatorMateDBSchema>(
  storeName: StoreName,
  key: string // Keys are strings in our schema
): Promise<void> => {
  try {
    const db = await getDb();
    // Assert storeName type for idb method
    await db.delete(storeName as StoreNameUnion, key);
  } catch (error) {
    console.error(`Error deleting item with key ${key} from ${storeName}:`, error);
    throw new Error(`Failed to delete item from ${storeName}`);
  }
};

/**
 * Clears all items from a specified object store.
 * Use with caution!
 * @param storeName - The name of the object store.
 */
export const clearStore = async <StoreName extends keyof MediatorMateDBSchema>(
  storeName: StoreName
): Promise<void> => {
    try {
        const db = await getDb();
        // Assert storeName type for idb method
        await db.clear(storeName as StoreNameUnion);
        console.log(`Cleared object store: ${storeName}`);
    } catch (error) {
        console.error(`Error clearing store ${storeName}:`, error);
        throw new Error(`Failed to clear store ${storeName}`);
    }
};

// --- Specific Operations (Example) ---
// You might add more specific functions here if needed,
// e.g., getNotesForCase(caseId: string)

export const getNotesForCase = async (caseFileNumber: string): Promise<Note[]> => {
    return getItemsByIndex('notes', 'by-caseFileNumber', caseFileNumber);
};

export const getDocumentsForCase = async (caseId: string): Promise<Document[]> => {
    return getItemsByIndex('documents', 'by-caseId', caseId);
};

export const getTasksByStatus = async (status: string): Promise<Task[]> => {
    return getItemsByIndex('tasks', 'by-status', status);
};

export const getTasksByDueDate = async (date: Date | IDBKeyRange): Promise<Task[]> => {
    // Example usage: getTasksByDueDate(IDBKeyRange.upperBound(new Date())) for overdue tasks
    return getItemsByIndex('tasks', 'by-dueDate', date);
};

export const getMattersByStatus = async (status: string): Promise<Matter[]> => {
    return getItemsByIndex('matters', 'by-status', status);
};

export const getContactsByName = async (lastName: string): Promise<Contact[]> => {
    // Note: This searches by lastName based on the current 'by-name' index
    return getItemsByIndex('contacts', 'by-name', lastName);
};

/**
 * Add a timeline event
 */
export const addTimelineEvent = async (event: import('@/types/models').TimelineEvent) => {
  return addItem('timeline', event);
};

/**
 * Get timeline events for a case, sorted by date descending
 */
export const getTimelineForCase = async (caseId: string) => {
  const all = await getItemsByIndex('timeline', 'by-caseId', caseId);
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Ensure the database is opened when the service loads (optional, depends on strategy)
// getDb().then(() => console.log("Database connection established.")).catch(console.error);

// Note: Ensure you have installed the 'idb' library:
// npm install idb
// or
// bun install idb