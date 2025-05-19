// src/types/models.ts
import type { DBSchema } from 'idb';

/**
 * Represents the metadata for a file associated with a specific case.
 */
export interface CaseFileMetadata {
  id: string; // Unique identifier for the file or folder metadata (e.g., UUID)
  caseId: string; // Identifier for the case this item belongs to
  parentId: string | null; // ID of the parent folder, or null for root level items
  itemType: 'file' | 'folder'; // Distinguishes between files and folders
  name: string; // Name of the file or folder (renamed from fileName for consistency)
  fileType?: string; // e.g., 'application/pdf', 'image/jpeg' (only relevant for files)
  fileSize?: number; // Size in bytes (only relevant for files)
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  storagePath?: string; // Path or reference to where the actual file blob is stored (only relevant for files)
}

/**
 * Represents a contact (Client, Attorney, Witness, etc.).
 */
export interface Contact {
  id: string; // Unique identifier (e.g., UUID)
  name: string;
  email: string;
  phone?: string; // Optional phone number
  company?: string; // Optional company name
  type: string; // e.g., 'Client', 'Attorney'
  caseFileNumbers?: string[]; // Associated case file numbers
  createdAt?: Date; // Optional: Track creation time
  updatedAt?: Date; // Optional: Track update time
}

/**
 * Represents a legal matter or case.
 */
export interface Matter {
  id: string; // Unique identifier (e.g., UUID or Case File Number if unique)
  caseFileNumber: string; // The primary case identifier shown to users
  title: string; // e.g., "Smith v. Jones Mediation"
  status: string; // e.g., 'Open', 'Closed', 'Pending'
  parties?: string[]; // List of involved parties (could reference Contact IDs)
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Add other relevant fields like 'matterType', 'startDate', etc.
}

/**
 * Represents a task associated with the mediation process.
 */
export interface Task {
    id: string; // Unique identifier
    title: string;
    description?: string;
    status: 'Todo' | 'In Progress' | 'Done' | 'Blocked';
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: Date;
    assignedTo?: string; // Could reference a Contact ID or user ID
    caseId?: string; // Link task to a specific case
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Represents a document stored in the system.
 * This might be similar to CaseFileMetadata but could represent generated documents, templates, etc.
 */
export interface Document {
    id: string; // Unique identifier
    title: string;
    type: string; // e.g., 'Agreement', 'Notes', 'Template'
    content?: string | object; // Could be text content or structured data
    caseId?: string; // Link document to a specific case
    createdAt: Date;
    updatedAt: Date;
    // Could include fields like 'version', 'author', etc.
    storageRef?: string; // If content is stored elsewhere (like CaseFileMetadata)
}

/**
 * Represents a note, often linked to a specific case or session.
 */
export interface Note {
    id: string; // Unique identifier
    caseFileNumber: string; // Link note to a specific case using its file number
    title?: string;
    content: string; // The actual note text (or potentially structured data)
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Represents an event in the timeline of a case.
 */
export interface TimelineEvent {
  id: string;
  caseId: string;
  type: 'meeting' | 'form' | 'clientDetails';
  action: 'created' | 'updated' | 'completed';
  description: string;
  date: string; // ISO timestamp
}


// --- IndexedDB Schema Definition ---
// Re-define here or import if defined elsewhere consistently
export interface MediatorMateDBSchema extends DBSchema {
  matters: {
    key: string;
    value: Matter;
    indexes: { 'by-status': string };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-caseFileNumber': string };
  };
  contacts: {
    key: string;
    value: Contact;
    indexes: { 'by-name': string };
  };
  documents: {
    key: string;
    value: Document;
    indexes: { 'by-caseId': string; 'by-type': string };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string; 'by-dueDate': Date };
  };
  caseFiles: { // Added store for CaseFileMetadata
      key: string;
      value: CaseFileMetadata;
      // Added 'by-parent' index for hierarchical structure
      indexes: { 'by-caseId': string; 'by-name': string; 'by-parent': [string, string | null] };
  };
  // Timeline event store
  timeline: {
    key: string;
    value: TimelineEvent;
    indexes: { 'by-caseId': string; 'by-date': string };
  };
  // Add the meetings store
  meetings: {
    key: string;
    value: Meeting;
    indexes: { 'by-caseId': string; 'by-date': string }; // Index by caseId and date
  };
  // Add other stores as needed
}