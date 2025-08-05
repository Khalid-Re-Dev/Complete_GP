#!/usr/bin/env python3
"""
Check JavaScript Exports for Best on Click
Verifies that all required exports exist in JavaScript modules.
"""

import re
from pathlib import Path

def check_exports():
    """Check exports in JavaScript files."""
    print("🔍 Checking JavaScript Exports")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public" / "js"
    
    # Files to check
    files_to_check = [
        "services/api.js",
        "services/auth.js", 
        "services/store.js",
        "utils/toast.js",
        "utils/helpers.js"
    ]
    
    for file_path in files_to_check:
        full_path = base_path / file_path
        if not full_path.exists():
            print(f"❌ {file_path} - File not found")
            continue
            
        try:
            content = full_path.read_text(encoding='utf-8')
            exports = find_exports(content)
            
            print(f"\n📄 {file_path}:")
            if exports:
                for export_type, export_name in exports:
                    print(f"  ✅ {export_type}: {export_name}")
            else:
                print(f"  ⚠️ No exports found")
                
        except Exception as e:
            print(f"❌ {file_path} - Error reading file: {e}")

def find_exports(content):
    """Find all exports in JavaScript content."""
    exports = []
    
    # Find named exports
    named_exports = re.findall(r'export\s+(?:const|let|var|function|class)\s+(\w+)', content)
    for name in named_exports:
        exports.append(("named", name))
    
    # Find export statements
    export_statements = re.findall(r'export\s+\{\s*([^}]+)\s*\}', content)
    for statement in export_statements:
        names = [name.strip() for name in statement.split(',')]
        for name in names:
            # Handle aliases (export { foo as bar })
            if ' as ' in name:
                original, alias = name.split(' as ')
                exports.append(("named", alias.strip()))
            else:
                exports.append(("named", name.strip()))
    
    # Find default export
    if re.search(r'export\s+default', content):
        exports.append(("default", "default"))
    
    return exports

def check_common_imports():
    """Check for common import patterns that might fail."""
    print("\n🔍 Checking Common Import Patterns")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public" / "js"
    
    # Common problematic imports
    problematic_patterns = [
        (r"import\s+\{\s*apiService\s*\}", "apiService import"),
        (r"import\s+\{\s*authService\s*\}", "authService import"),
        (r"import\s+\{\s*reportsService\s*\}", "reportsService import"),
        (r"import\s+\{\s*promotionsService\s*\}", "promotionsService import"),
        (r"import\s+\{\s*toastManager\s*\}", "toastManager import"),
    ]
    
    # Search all JS files
    js_files = list(base_path.rglob("*.js"))
    
    for pattern, description in problematic_patterns:
        print(f"\n🔍 Searching for: {description}")
        found_files = []
        
        for js_file in js_files:
            try:
                content = js_file.read_text(encoding='utf-8')
                if re.search(pattern, content):
                    relative_path = js_file.relative_to(base_path)
                    found_files.append(str(relative_path))
            except:
                continue
        
        if found_files:
            print(f"  Found in {len(found_files)} files:")
            for file_path in found_files[:5]:  # Show first 5
                print(f"    - {file_path}")
            if len(found_files) > 5:
                print(f"    ... and {len(found_files) - 5} more")
        else:
            print(f"  ✅ No files found (good)")

def generate_fix_suggestions():
    """Generate suggestions to fix export issues."""
    print("\n💡 Fix Suggestions")
    print("=" * 40)
    
    suggestions = [
        "1. Check that api.js exports 'apiService'",
        "2. Verify auth.js exports 'authService'", 
        "3. Ensure toast.js exports 'toastManager'",
        "4. Add aliases for backward compatibility",
        "5. Use consistent naming (reportService vs reportsService)",
        "6. Test imports with: http://localhost:3000/test-imports.html",
        "7. Check browser console for specific error messages",
        "8. Verify file paths are correct"
    ]
    
    for suggestion in suggestions:
        print(f"   {suggestion}")

def main():
    """Main function."""
    print("📋 Best on Click - Export Check")
    print("=" * 50)
    
    check_exports()
    check_common_imports()
    generate_fix_suggestions()
    
    print("\n🧪 Test your fixes at:")
    print("   http://localhost:3000/test-imports.html")

if __name__ == "__main__":
    main()