# Plan: Link Contacts, Case Files, and Documents via Case File Number

This plan outlines the steps taken and remaining to integrate a `caseFileNumber` across different parts of the application.

## Summary of Changes Made (Architect Mode):

1.  **Contacts (`src/pages/Contacts.tsx`, `src/components/dialogs/*-contact-dialog.tsx`):**
    *   Confirmed `caseFileNumbers` (array of strings) exists in create and edit dialogs.
    *   Updated `Contacts.tsx` to display these numbers.
    *   Added mock `caseFileNumbers` to `initialContacts` in `Contacts.tsx`.
    *   Added logic to `Contacts.tsx` to load matter data from localStorage.
    *   Implemented clickable links in `Contacts.tsx` from displayed `caseFileNumbers` to the corresponding `/case-files/:id` route.

2.  **Case Files (`src/pages/CaseFiles.tsx`, `src/App.tsx`):**
    *   Confirmed `CaseFiles.tsx` uses a unique `caseFileNumber` (string) for each matter (case file).
    *   Confirmed `App.tsx` has a route `/case-files/:id` for displaying case file details.

3.  **Documents (`src/pages/Documents.tsx`):**
    *   Updated the `Document` interface to use `caseFileNumber: string` instead of `matter: string`.
    *   Updated the `initialDocuments` mock data to use `caseFileNumber`.
    *   Updated the filtering and display logic to reference `caseFileNumber`.

## Pending Code Changes (Requires Code Mode):

1.  **Document Dialogs:**
    *   Update `src/components/dialogs/create-document-dialog.tsx`: Modify the Zod schema, form `defaultValues`, and `FormField` (name, label, placeholder) to use `caseFileNumber` instead of `matter`.
    *   Update `src/components/dialogs/edit-document-dialog.tsx`: Apply similar changes as above to use `caseFileNumber`.

2.  **(Optional Future Enhancement):**
    *   Consider adding links from the `Documents.tsx` page (specifically the displayed `caseFileNumber`) back to the relevant Case File page (`/case-files/:id`). This would require loading matter data (similar to how it was done in `Contacts.tsx`) to map the `caseFileNumber` to the matter `id`.

## Next Steps:

*   Switch to Code mode to implement the pending changes in the document dialog `.tsx` files.