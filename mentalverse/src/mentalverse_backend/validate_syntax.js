// Simple syntax validation for Motoko files
const fs = require('fs');
const path = require('path');

function validateMotokoSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic syntax checks
        const issues = [];
        
        // Check for balanced braces
        let braceCount = 0;
        let parenCount = 0;
        let bracketCount = 0;
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            switch (char) {
                case '{':
                    braceCount++;
                    break;
                case '}':
                    braceCount--;
                    break;
                case '(':
                    parenCount++;
                    break;
                case ')':
                    parenCount--;
                    break;
                case '[':
                    bracketCount++;
                    break;
                case ']':
                    bracketCount--;
                    break;
            }
        }
        
        if (braceCount !== 0) issues.push(`Unbalanced braces: ${braceCount}`);
        if (parenCount !== 0) issues.push(`Unbalanced parentheses: ${parenCount}`);
        if (bracketCount !== 0) issues.push(`Unbalanced brackets: ${bracketCount}`);
        
        // Check for common syntax issues
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // Check for missing semicolons after statements
            if (line.trim().match(/^(let|var|public|private).*[^;{]$/)) {
                if (!line.includes('=') || !line.includes('{')) {
                    issues.push(`Line ${lineNum}: Possible missing semicolon`);
                }
            }
            
            // Check for invalid import syntax
            if (line.includes('import') && !line.match(/import\s+\w+\s+"[^"]+";/)) {
                if (line.trim() !== '' && !line.includes('//')) {
                    issues.push(`Line ${lineNum}: Invalid import syntax`);
                }
            }
        });
        
        return {
            valid: issues.length === 0,
            issues: issues,
            file: filePath
        };
        
    } catch (error) {
        return {
            valid: false,
            issues: [`File read error: ${error.message}`],
            file: filePath
        };
    }
}

// Validate main.mo
const mainMoPath = path.join(__dirname, 'main.mo');
const result = validateMotokoSyntax(mainMoPath);

console.log('\n=== Motoko Syntax Validation ===');
console.log(`File: ${result.file}`);
console.log(`Valid: ${result.valid}`);

if (result.issues.length > 0) {
    console.log('\nIssues found:');
    result.issues.forEach(issue => {
        console.log(`  - ${issue}`);
    });
} else {
    console.log('\nNo syntax issues detected!');
}

console.log('\n=== Validation Complete ===\n');