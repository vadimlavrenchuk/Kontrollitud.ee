#!/bin/bash

# 🔒 Pre-Push Security Check (Linux/Mac version)
# Проверка на наличие секретов перед push в GitHub
# Использование: ./pre-push-check.sh

set +e  # Continue on error

FOUND_SECRETS=false
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Scanning for secrets before push...${NC}"
echo "======================================"
echo ""

# Function to check patterns
check_pattern() {
    local pattern=$1
    local description=$2
    local file_pattern=${3:-"*.md"}
    
    echo -e "${YELLOW}Checking: $description...${NC}"
    
    local matches=$(find . -type f -name "$file_pattern" ! -path "*/node_modules/*" ! -path "*/.local.*" ! -name "*.local" -exec grep -l -E "$pattern" {} \; 2>/dev/null)
    
    if [ ! -z "$matches" ]; then
        echo -e "${RED}❌ WARNING: Found potential secrets!${NC}"
        echo "$matches" | while read file; do
            echo -e "   📄 $file"
            grep -n -E "$pattern" "$file" | head -3 | while read line; do
                echo -e "      ${NC}$line${NC}"
            done
        done
        echo ""
        FOUND_SECRETS=true
    else
        echo -e "${GREEN}✅ OK${NC}"
    fi
}

# 1. Check for IP addresses
check_pattern '\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b' "IP addresses"

# 2. Check for SSH commands with real hosts
check_pattern 'ssh root@[a-zA-Z0-9\.\-]+' "SSH commands with real hosts"

# 3. Check for SCP commands
check_pattern 'scp .* root@[a-zA-Z0-9\.\-]+' "SCP commands with real hosts"

# 4. Check for admin emails
check_pattern 'vadim[a-zA-Z0-9]*@' "Admin email addresses"

# 5. Check for passwords and keys
check_pattern '(password|passwd|pwd|secret|token|key)\s*[=:]\s*['"'"'"][^'"'"'"]{8,}' "Passwords and API keys"

# 6. Check for API keys
check_pattern '(API_KEY|APIKEY|SECRET|TOKEN)\s*[=:]\s*['"'"'"]?[A-Za-z0-9_\-]{20,}' "Real API keys"

# 7. Check for personal paths (Windows style)
check_pattern 'C:\\Users\\vadim' "Personal file paths"

# 8. Check for production domains
check_pattern 'root@kontrollitud\.ee' "Production SSH commands"

# 9. Check staged files
echo -e "${YELLOW}Checking staged files for secrets...${NC}"
STAGED_FILES=$(git diff --cached --name-only | grep -E '\.(md|ps1|sh|conf|json)$')

if [ ! -z "$STAGED_FILES" ]; then
    for file in $STAGED_FILES; do
        if [ -f "$file" ]; then
            if grep -qE '([0-9]{1,3}\.){3}[0-9]{1,3}|vadim[a-zA-Z0-9]*@|ssh root@[a-zA-Z]|[A-Za-z0-9_\-]{30,}' "$file"; then
                echo -e "${RED}⚠️  Staged file may contain secrets: $file${NC}"
                FOUND_SECRETS=true
            fi
        fi
    done
    if [ "$FOUND_SECRETS" = false ]; then
        echo -e "${GREEN}✅ Staged files OK${NC}"
    fi
fi

# 10. Check for .local files in staging
echo ""
echo -e "${YELLOW}Checking for .local files in staging...${NC}"
LOCAL_STAGED=$(git diff --cached --name-only | grep -E '\.local\.|\.local$')
if [ ! -z "$LOCAL_STAGED" ]; then
    echo -e "${RED}❌ ERROR: .local files are staged!${NC}"
    echo "$LOCAL_STAGED" | while read file; do
        echo -e "   📄 $file"
    done
    FOUND_SECRETS=true
else
    echo -e "${GREEN}✅ No .local files in staging${NC}"
fi

# Final result
echo ""
echo "======================================"
if [ "$FOUND_SECRETS" = true ]; then
    echo -e "${RED}❌ SECURITY CHECK FAILED!${NC}"
    echo ""
    echo -e "${YELLOW}Found potential secrets in your code.${NC}"
    echo -e "${YELLOW}Please review and fix before pushing.${NC}"
    echo ""
    echo -e "${CYAN}Recommendations:${NC}"
    echo "1. Move sensitive data to .local files"
    echo "2. Use placeholders like YOUR_SERVER, YOUR_API_KEY"
    echo "3. Check .gitignore is up to date"
    echo "4. Use environment variables for secrets"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ SECURITY CHECK PASSED!${NC}"
    echo ""
    echo "No obvious secrets detected."
    echo "Safe to push to GitHub."
    echo ""
    exit 0
fi
