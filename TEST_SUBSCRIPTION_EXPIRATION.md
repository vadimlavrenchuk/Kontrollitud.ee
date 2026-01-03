# Тестирование системы истечения подписок

## 1. Создание тестовых компаний

### Компания с истекшей Pro подпиской

```powershell
$body = @{
    name = "Test Pro Company - EXPIRED"
    email = "test-pro@kontrollitud.ee"
    userEmail = "vadim5239@gmail.com"
    phone = "+372 5555 1111"
    address = "Tallinn, Estonia"
    subscriptionLevel = "pro"
    planExpiresAt = "2025-12-31"
    image = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400"
    instagramUrl = "https://instagram.com/testpro"
    tiktokUrl = "https://tiktok.com/@testpro"
    approvalStatus = "approved"
    isVerified = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/companies" -Method Post -Body $body -ContentType "application/json"
```

### Компания с Pro подпиской, истекающей через 3 дня

```powershell
$expiryDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")

$body = @{
    name = "Test Pro Company - EXPIRING SOON"
    email = "test-pro-expiring@kontrollitud.ee"
    userEmail = "vadim5239@gmail.com"
    phone = "+372 5555 2222"
    address = "Tallinn, Estonia"
    subscriptionLevel = "pro"
    planExpiresAt = $expiryDate
    image = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400"
    instagramUrl = "https://instagram.com/testpro2"
    approvalStatus = "approved"
    isVerified = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/companies" -Method Post -Body $body -ContentType "application/json"
```

### Компания с истекшей Enterprise подпиской

```powershell
$body = @{
    name = "Test Enterprise Company - EXPIRED"
    email = "test-enterprise@kontrollitud.ee"
    userEmail = "vadim5239@gmail.com"
    phone = "+372 5555 3333"
    address = "Tallinn, Estonia"
    subscriptionLevel = "enterprise"
    planExpiresAt = "2025-12-31"
    image = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400"
    instagramUrl = "https://instagram.com/testent"
    tiktokUrl = "https://tiktok.com/@testent"
    youtubeUrl = "https://youtube.com/@testent"
    blogArticleUrl = "https://blog.example.com/article"
    approvalStatus = "approved"
    isVerified = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/companies" -Method Post -Body $body -ContentType "application/json"
```

## 2. Проверка созданных компаний

```powershell
# Получить все компании с истекшими подписками
Invoke-RestMethod -Uri "http://localhost:5000/api/companies" | 
    ConvertTo-Json -Depth 10 | 
    Out-File -FilePath "test-companies-before.json"

Write-Host "Сохранено в test-companies-before.json" -ForegroundColor Green
```

## 3. Запуск проверки подписок вручную

```powershell
$result = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/test-subscription-check"
Write-Host $result.message -ForegroundColor Cyan
```

## 4. Проверка результатов после downgrade

```powershell
# Получить все компании после downgrade
Invoke-RestMethod -Uri "http://localhost:5000/api/companies" | 
    ConvertTo-Json -Depth 10 | 
    Out-File -FilePath "test-companies-after.json"

Write-Host "Сохранено в test-companies-after.json" -ForegroundColor Green
```

## 5. Проверка конкретной компании

```powershell
# Замените ID на актуальный из предыдущих запросов
$companyId = "YOUR_COMPANY_ID_HERE"

$company = Invoke-RestMethod -Uri "http://localhost:5000/api/companies"
$testCompany = $company | Where-Object { $_.name -like "*Test*" } | Select-Object -First 1

Write-Host "Company: $($testCompany.name)" -ForegroundColor Yellow
Write-Host "Subscription: $($testCompany.subscriptionLevel)" -ForegroundColor Yellow
Write-Host "Expires: $($testCompany.planExpiresAt)" -ForegroundColor Yellow
Write-Host "Image: $($testCompany.image)" -ForegroundColor Yellow
Write-Host "Instagram: $($testCompany.instagramUrl)" -ForegroundColor Yellow
Write-Host "Verified: $($testCompany.isVerified)" -ForegroundColor Yellow
```

## 6. Проверка логов Docker

```powershell
docker logs kontrollitudee-backend-1 --tail 50 | Select-String -Pattern "subscription|downgrade|reminder"
```

## 7. Ожидаемые результаты

### Для истекших подписок (Pro/Enterprise → Basic):
- ✅ `subscriptionLevel` изменен на `"basic"`
- ✅ `image` очищен (null)
- ✅ `instagramUrl` очищен (null)
- ✅ `tiktokUrl` очищен (null)
- ✅ `youtubeUrl` очищен (null)
- ✅ `blogArticleUrl` очищен (null)
- ✅ `isVerified` = false
- ✅ `planDowngradedAt` = текущая дата
- ✅ Email отправлен на userEmail

### Для подписок, истекающих через 3 дня:
- ✅ Email-предупреждение отправлено
- ✅ `planReminderSent` = true
- ⚠️ Подписка еще активна (не downgraded)

### Логи в консоли:

```
⏰ Cron job triggered: Daily subscription check
📧 Sending expiration reminders...
   Found 1 companies expiring in 3 days
   ✅ Reminder sent to vadim5239@gmail.com
⬇️ Downgrading expired subscriptions...
   Found 2 expired subscriptions
   ✅ Downgraded "Test Pro Company - EXPIRED" from pro to basic
   ✅ Downgraded "Test Enterprise Company - EXPIRED" from enterprise to basic
✅ Subscription check completed successfully
```

## 8. Продление подписки (Manual Renewal)

```powershell
$companyId = "YOUR_COMPANY_ID_HERE"

$body = @{
    months = 1
    plan = "pro"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/companies/$companyId/extend-subscription" -Method Patch -Body $body -ContentType "application/json"
```

## 9. Очистка тестовых данных

```powershell
# Получить все тестовые компании
$companies = Invoke-RestMethod -Uri "http://localhost:5000/api/companies"
$testCompanies = $companies | Where-Object { $_.name -like "*Test*" }

# Удалить каждую (нужно добавить DELETE endpoint или через MongoDB)
Write-Host "Найдено $($testCompanies.Count) тестовых компаний" -ForegroundColor Yellow
$testCompanies | ForEach-Object {
    Write-Host "  - $($_.name) ($_id)" -ForegroundColor Gray
}
```

## 10. Проверка SMTP (только если настроен)

Если SMTP настроен правильно, вы должны получить email на `vadim5239@gmail.com` с темой:
- **"⚠️ Your subscription expires in 3 days"** (для компаний, истекающих через 3 дня)
- **"❌ Your subscription has expired"** (для истекших компаний)

## Troubleshooting

### Email не отправляется:
1. Проверьте SMTP credentials в `backend/.env`
2. Для Gmail: убедитесь, что включен 2FA и создан App Password
3. Проверьте логи: `docker logs kontrollitudee-backend-1 | Select-String "Error"`

### Downgrade не происходит:
1. Проверьте, что `planExpiresAt` в прошлом
2. Убедитесь, что `subscriptionLevel` = "pro" или "enterprise" (не "basic")
3. Проверьте MongoDB connection в логах

### Cron job не запускается:
1. Проверьте инициализацию: `docker logs kontrollitudee-backend-1 | Select-String "Cron"`
2. Для теста измените расписание на `*/5 * * * *` (каждые 5 минут)
3. Перезапустите контейнер: `docker-compose restart backend`
