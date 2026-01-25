# AI Rules for Dyad Development

- **NEVER DELETE EXISTING ROUTES:** When updating `src/App.tsx`, you must keep all existing `<Route>` components. Only add new ones.
- **PRESERVE ALL IMPORTS:** Do not remove existing imports unless the file they refer to has been deleted.
- **NO PLACEHOLDERS:** Never use `// ... rest of code` or similar comments. If you use `<dyad-write>`, provide the FULL file content.
- **SURGICAL EDITS:** Prefer `<dyad-search-replace>` for large files to avoid accidental deletion of existing logic.
- **FUNCTIONALITY FIRST:** Before adding new features, read the existing code to ensure your changes don't break current functionality.
- **STRICT ROUTING:** All new pages must be added to `src/App.tsx` and have a corresponding file in `src/pages/`.
