# Как добавить нового администратора

## ✅ Текущее решение (самое простое)

Администраторы определяются **списком email-адресов в коде**.

### Шаг 1: Добавьте email в ProtectedRoute.jsx

Откройте файл `frontend/src/ProtectedRoute.jsx` и добавьте свой email в массив `ADMIN_EMAILS`:

```javascript
const ADMIN_EMAILS = [
    'vadim5239@gmail.com',           // ваш текущий
    'vadimlavrenchuk@yahoo.com',     // ваш текущий
    'newadmin@example.com',          // добавьте сюда новый email
    'admin@kontrollitud.ee'
];
```

### Шаг 2: Пересоберите frontend

```bash
docker compose up -d --build frontend
```

### Шаг 3: Войдите с этим email

1. Зарегистрируйтесь или войдите на сайте с этим email
2. Перейдите на `/admin`
3. Готово! У вас есть доступ к админ-панели

## 🔐 Текущие админы

- `vadim5239@gmail.com`
- `vadimlavrenchuk@yahoo.com`

## 📝 Как это работает

Файл `ProtectedRoute.jsx` проверяет:
1. Авторизован ли пользователь через Firebase Auth
2. Есть ли email пользователя в списке `ADMIN_EMAILS`
3. Если да - показывает админ-панель
4. Если нет - показывает "Access Denied"

## 🚀 Альтернативное решение (через Firestore)

Если хотите управлять админами через базу данных:

### 1. Создайте коллекцию в Firestore

1. Откройте Firebase Console
2. Firestore Database → Start Collection
3. Название: `admins`

### 2. Добавьте админа

1. Add Document
2. **Document ID:** UID пользователя (например: `ncDAMgP2yoYcMVCqwk1avIL51Oo1`)
3. **Field:** `role` (type: string) = `"admin"`
4. **Field:** `email` (type: string) = `"vadim5239@gmail.com"`
5. Save

### 3. Обновите ProtectedRoute.jsx

```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);
    
    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setChecking(false);
                return;
            }
            
            try {
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                setIsAdmin(adminDoc.exists() && adminDoc.data().role === 'admin');
            } catch (error) {
                console.error('Error checking admin:', error);
                setIsAdmin(false);
            }
            setChecking(false);
        };
        
        checkAdmin();
    }, [user]);
    
    if (loading || checking) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    
    if (!isAdmin) {
        return <div>Access Denied</div>;
    }
    
    return children;
}
```

## 💡 Рекомендация

Для вашего случая **проще использовать текущее решение** (список email в коде), так как:
- ✅ Быстро настраивается
- ✅ Нет дополнительных запросов к базе
- ✅ Легко добавить/удалить админов
- ✅ Не нужно создавать дополнительные коллекции

Когда проект вырастет, можно перейти на Firestore-решение.
