# PowerShell script to fix lucide-react imports
# This script converts named imports to default imports for lucide-react icons

$frontendPath = "c:\Users\User\Desktop\MentalVerse\frontend\src"

# Get all TypeScript and TSX files
$files = Get-ChildItem -Path $frontendPath -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Pattern to match lucide-react named imports
    $pattern = 'import\s*\{([^}]+)\}\s*from\s*["'']lucide-react["''];?'
    
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $importList = $match.Groups[1].Value
        $icons = $importList -split ',' | ForEach-Object { $_.Trim() }
        
        # Create individual import statements
        $newImports = @()
        foreach ($icon in $icons) {
            if ($icon -ne '') {
                # Convert PascalCase to kebab-case
                $kebabCase = $icon -creplace '([A-Z])', '-$1' -replace '^-', '' | ForEach-Object { $_.ToLower() }
                $newImports += "import $icon from `"lucide-react/dist/esm/icons/$kebabCase`";"
            }
        }
        
        # Replace the original import with new imports
        $content = $content -replace [regex]::Escape($match.Value), ($newImports -join "`r`n")
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed imports in: $($file.FullName)"
    }
}

Write-Host "Lucide-react import fixes completed!"