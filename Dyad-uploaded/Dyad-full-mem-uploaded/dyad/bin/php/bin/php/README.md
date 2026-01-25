# PHP Configuration for Dyad

This directory contains PHP 7.1 for Windows, configured to work with Dyad's MySQL integration.

## Quick Setup

Run the setup script to automatically configure PHP:

```batch
setup-php.bat
```

This will:
- Check and fix php.ini configuration
- Remove old Vertrigo paths
- Set correct extension_dir
- Test PHP executable
- Verify MySQL extensions are loaded

## Manual Configuration

If you need to manually configure PHP, edit `php.ini`:

### Required Settings

```ini
; Extension directory (relative path)
extension_dir = "ext"

; MySQL Extensions (must be enabled)
extension=php_mysqli.dll
extension=php_pdo_mysql.dll
extension=php_mysql.dll
```

### Important Paths

All paths in php.ini should be **relative** to the PHP directory:

✅ **Correct:**
```ini
extension_dir = "ext"
```

❌ **Wrong:**
```ini
extension_dir = "E:\vertrigo\php\ext"
```

## Testing PHP

### Test PHP Version
```batch
bin\php\php.exe -v
```

### Test PHP Configuration
```batch
bin\php\php.exe -i
```

### Test MySQL Extensions
```batch
bin\php\php.exe -m | findstr mysql
```

Expected output:
```
mysqli
mysql
pdo_mysql
```

## Directory Structure

```
bin/php/
├── php.exe                 # PHP executable
├── php.ini                 # Main configuration file
├── php.ini-development     # Development template
├── php.ini-production      # Production template
├── setup-php.bat           # Auto-configuration script
├── ext/                    # PHP extensions (DLLs)
│   ├── php_mysqli.dll
│   ├── php_pdo_mysql.dll
│   └── php_mysql.dll
└── *.dll                   # Required system libraries
```

## Troubleshooting

### Problem: "php.exe is not recognized"

**Solution:** Use the full path or add to PATH:
```batch
set PATH=%PATH%;%CD%\bin\php
```

### Problem: "mysqli extension not loaded"

**Solution:** 
1. Check `php.ini` has: `extension=php_mysqli.dll`
2. Verify `ext/php_mysqli.dll` exists
3. Run `setup-php.bat` to auto-fix

### Problem: "libmysql.dll not found"

**Solution:** 
- `libmysql.dll` should be in the same directory as `php.exe`
- If missing, copy from `ext/` or download MySQL Connector

### Problem: Old Vertrigo paths in php.ini

**Solution:**
Run `setup-php.bat` - it will automatically remove old paths.

## Integration with Dyad

Dyad uses this PHP installation for:

1. **MySQL Query Execution** - via `src/integrations/mysql/executor.ts`
2. **PHP Script Execution** - for backend operations
3. **Database Management** - creating tables, running migrations

### MySQL Configuration

To use MySQL with Dyad, configure connection in the app:

- **Host:** localhost (or your MySQL server)
- **Port:** 3306
- **Username:** root (or your MySQL user)
- **Password:** (your MySQL password)
- **Database:** (your database name)

## PHP Version

- **Version:** PHP 7.1.26
- **Architecture:** x64 (Windows)
- **Thread Safety:** Enabled
- **Compiler:** MSVC14 (Visual C++ 2015)

## Required DLLs

The following DLLs must be present in this directory:

- `php7ts.dll` - PHP core library
- `libmysql.dll` - MySQL client library
- `ssleay32.dll`, `libeay32.dll` - OpenSSL libraries
- `icudt57.dll`, `icuin57.dll`, `icuuc57.dll` - ICU libraries

All required DLLs are included in this distribution.

## Support

For issues with PHP configuration:

1. Run `setup-php.bat` first
2. Check this README for troubleshooting
3. Verify all DLL files are present
4. Test with `php.exe -v`

For Dyad-specific issues, see main project documentation.
