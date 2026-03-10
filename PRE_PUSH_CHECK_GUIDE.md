# 🔒 Pre-Push Security Check - Setup Guide

## Что это?

Скрипт автоматической проверки кода на наличие секретов перед отправкой в GitHub.

## 📋 Что проверяет:

- ✅ IP адреса серверов
- ✅ SSH команды с реальными хостами
- ✅ Admin email адреса
- ✅ Пароли и API ключи
- ✅ Личные пути к файлам
- ✅ Production домены
- ✅ .local файлы в staging
- ✅ Staged файлы с подозрительным содержимым

## 🚀 Использование

### Ручной запуск (Windows):
```powershell
.\pre-push-check.ps1
```

### Ручной запуск (Linux/Mac):
```bash
chmod +x pre-push-check.sh
./pre-push-check.sh
```

## 🔧 Автоматический запуск перед git push

### Вариант 1: Git Hook (рекомендуется)

#### Windows (PowerShell):
```powershell
# 1. Создать pre-push hook
New-Item -ItemType File -Path ".git\hooks\pre-push" -Force

# 2. Добавить содержимое
@"
#!/bin/sh
# Pre-push hook to check for secrets

echo "Running security check..."
powershell.exe -ExecutionPolicy Bypass -File ./pre-push-check.ps1

if [ `$? -ne 0 ]; then
    echo "Push aborted due to security check failure."
    echo "Fix the issues or use 'git push --no-verify' to bypass (NOT RECOMMENDED)."
    exit 1
fi
"@ | Set-Content -Path ".git\hooks\pre-push"
```

#### Linux/Mac:
```bash
# 1. Создать pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
# Pre-push hook to check for secrets

echo "Running security check..."
./pre-push-check.sh

if [ $? -ne 0 ]; then
    echo "Push aborted due to security check failure."
    echo "Fix the issues or use 'git push --no-verify' to bypass (NOT RECOMMENDED)."
    exit 1
fi
EOF

# 2. Сделать исполняемым
chmod +x .git/hooks/pre-push
chmod +x pre-push-check.sh
```

### Вариант 2: Alias в .gitconfig

Добавьте в `~/.gitconfig`:

```ini
[alias]
    safe-push = "!powershell.exe -ExecutionPolicy Bypass -File ./pre-push-check.ps1 && git push"
```

Использование:
```bash
git safe-push
```

### Вариант 3: Перед каждым push вручную

Просто запускайте скрипт перед push:

```powershell
# 1. Проверка
.\pre-push-check.ps1

# 2. Если OK, пушим
git push
```

## 📊 Пример вывода

### ✅ Успешная проверка:
```
🔍 Scanning for secrets before push...
======================================

Checking: IP addresses...
✅ OK
Checking: SSH commands with real hosts...
✅ OK
...
======================================
✅ SECURITY CHECK PASSED!

No obvious secrets detected.
Safe to push to GitHub.
```

### ❌ Найдены секреты:
```
🔍 Scanning for secrets before push...
======================================

Checking: IP addresses...
❌ WARNING: Found 3 potential secrets!
   📄 ./DEPLOYMENT_GUIDE.md
      Line 45: ssh root@YOUR_SERVER_IP
...
======================================
❌ SECURITY CHECK FAILED!

Found potential secrets in your code.
Please review and fix before pushing.

Recommendations:
1. Move sensitive data to .local files
2. Use placeholders like YOUR_SERVER, YOUR_API_KEY
3. Check .gitignore is up to date
4. Use environment variables for secrets
```

## 🔧 Настройка чувствительности

Если скрипт выдает слишком много false positives, отредактируйте паттерны в скрипте:

```powershell
# Например, исключить определенные файлы:
$matches = Get-ChildItem -Recurse -Include $FilePattern -File | 
           Where-Object { $_.Name -ne "SECURITY.md" } |  # Исключить файл
           Select-String -Pattern $Pattern -AllMatches
```

## ⚠️ Обход проверки (НЕ РЕКОМЕНДУЕТСЯ!)

Если очень нужно пропустить проверку:

```bash
git push --no-verify
```

**Используйте только если уверены что нет секретов!**

## 🔄 Обновление скрипта

Если вы обновили скрипт проверки, перезапустите hook:

```powershell
# Windows
Remove-Item .git\hooks\pre-push
# Затем снова создайте hook (см. выше)
```

```bash
# Linux/Mac
rm .git/hooks/pre-push
# Затем снова создайте hook (см. выше)
```

## 📚 Дополнительная информация

- **Документация**: См. SECURITY.md для полного руководства
- **Правила безопасности**: См. PROJECT_CONTEXT.md
- **Аудит**: См. SECURITY_AUDIT_COMPLETE.md

## 🆘 Troubleshooting

### Скрипт не запускается на Windows
```powershell
# Разрешить выполнение скриптов
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Скрипт не запускается на Linux/Mac
```bash
# Сделать исполняемым
chmod +x pre-push-check.sh
```

### Git hook не работает
```bash
# Проверить что hook существует
ls -la .git/hooks/pre-push

# Проверить что hook исполняемый (Linux/Mac)
chmod +x .git/hooks/pre-push
```

---

**Совет**: Запускайте проверку вручную перед важными коммитами, даже если hook установлен!
