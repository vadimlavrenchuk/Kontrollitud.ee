# 🔒 SECURITY.md - Security Guidelines

## ⚠️ Important: This is a PUBLIC repository

This repository is public on GitHub. **NEVER commit sensitive data**, including:

### 🚫 What NOT to commit

- ❌ API keys and secrets
- ❌ Database passwords
- ❌ SSH keys or credentials
- ❌ Server IP addresses
- ❌ Admin email addresses
- ❌ Production URLs with authentication
- ❌ Personal file paths (e.g., `C:\Users\YourName\...`)
- ❌ Deployment scripts with real server details

### ✅ Protected Files

All sensitive files are protected by `.gitignore`:

- `*.local.*` - Local configuration files
- `*.local` - Local files
- `deploy*.ps1` - Deployment scripts (except `deploy.example.ps1`)
- `*SETUP*.md` - Setup documentation with server details
- `*SERVER*.md` - Server configuration files
- `*ADMIN*.md` - Admin documentation
- `.env` files - Environment variables

### 📝 How to Work Safely

1. **Use Environment Variables**
   - All secrets go in `.env` files
   - `.env` files are git-ignored
   - Use `.env.example` for templates (without real values)

2. **Use .local Files**
   - Create `filename.local.md` or `script.local.ps1` for private docs
   - These are automatically ignored by git
   - Example: `deploy.local.ps1` (your real deployment script)

3. **Use Placeholders in Public Docs**
   - ✅ `ssh root@YOUR_SERVER`
   - ❌ `ssh root@YOUR_SERVER_IP`
   - ✅ `VITE_API_KEY=...`
   - ❌ `VITE_API_KEY=abc123real-key`

### 🛠️ Setup for New Team Members

1. Copy example files:
   ```bash
   cp .env.example .env
   cp deploy.example.ps1 deploy.local.ps1
   ```

2. Edit `.local` files with real values
   - Server IPs
   - SSH credentials
   - Admin emails
   - API keys

3. These files stay on your machine only (git-ignored)

### 🔍 Before Committing

Always check what you're committing:

```bash
# Review changes
git diff

# Check for sensitive data
git diff | grep -i "password\|secret\|key\|@.*\.\|[0-9]\{1,3\}\.[0-9]"

# If found, use .gitignore or .local files instead
```

### 📚 Public Documentation Strategy

- **Public docs**: General setup, architecture, usage instructions
- **Private docs** (`.local.md`): Server details, credentials, deployment specifics
- **PROJECT_CONTEXT.md**: Safe starting point for AI assistants

### 🚨 If You Accidentally Committed Secrets

1. **Don't panic** - but act quickly
2. **Rotate/change** the exposed credentials immediately
3. **Remove from git history**:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch PATH_TO_FILE" \
   --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push** (careful!): `git push origin --force --all`
5. **Notify team** if working with others

### ✅ Security Checklist

Before making the repository public:

- [ ] All `.env` files are git-ignored
- [ ] No API keys in code
- [ ] No production URLs with credentials
- [ ] No server IPs or SSH details
- [ ] No admin emails or passwords
- [ ] All deployment scripts use `.local.ps1` extension
- [ ] Setup instructions use placeholders
- [ ] Personal file paths replaced with generic ones
- [ ] `.gitignore` includes all sensitive patterns

### 🔐 Current Security Status

✅ `.gitignore` configured for sensitive files  
✅ Environment variables in `.env` files (ignored)  
✅ Deployment scripts renamed to `.local.ps1`  
✅ Setup docs renamed to `.local.md`  
✅ Admin docs protected with `.local` extension  
✅ Public docs sanitized (no IPs, passwords, personal paths)  

---

**Remember**: When in doubt, use `.local` extension or environment variables!
