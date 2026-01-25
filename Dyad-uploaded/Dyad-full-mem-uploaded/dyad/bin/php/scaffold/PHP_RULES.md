# PHP Development Rules for Dyad

When building PHP applications, follow these strict guidelines:

## 1. Project Structure
- **Entry Point**: Always use `index.php` as the main entry point.
- **Organization**: 
  - `/api` - for backend logic and data handling.
  - `/components` - for reusable UI elements (PHP includes).
  - `/assets` - for CSS, JS, and images.
  - `/includes` - for configuration, database connections, and helper functions.

## 2. Coding Standards
- Use **modern PHP** (PHP 8.0+ features where applicable).
- Use **PDO** for database operations to prevent SQL injection.
- Keep logic and presentation separate as much as possible.
- Use `require_once` for essential files.

## 3. UI & Styling
- Use **Tailwind CSS via CDN** for rapid development:
  `<script src="https://cdn.tailwindcss.com"></script>`
- Ensure all pages are responsive.

## 4. Preservation (CRITICAL)
- **NEVER delete existing code** unless explicitly asked.
- When updating a file, keep all existing functions and includes.
- If you add a new feature, integrate it into the existing `index.php` or create a new file and link to it.

## 5. Environment
- Assume a standard Apache/Nginx environment with PHP support.
- Do not suggest complex server configurations unless necessary.
