# Store Management System

نظام إدارة المتاجر المتكامل لمنصة Best on Click

## الميزات الرئيسية

### 1. تطبيق إنشاء المتجر
- نموذج شامل لتقديم طلب إنشاء متجر
- رفع المستندات المطلوبة (السجل التجاري، الهوية)
- مراجعة الطلبات من قبل الإدارة
- إشعارات تلقائية بحالة الطلب

### 2. لوحة تحكم المالك
- إحصائيات شاملة عن أداء المتجر
- عرض المنتجات الأكثر مبيعاً
- إدارة الإشعارات
- عرض آراء العملاء الحديثة

### 3. نظام التحليلات المتقدم
- تتبع المشاهدات والزوار الفريدين
- تحليل التفاعل مع المنتجات
- نقاط الأداء (الشعبية، التفاعل، الجودة)
- تقارير قابلة للتصدير

### 4. إدارة آراء العملاء
- نظام تقييم متعدد المستويات
- إمكانية الرد على المراجعات
- تصفية وترتيب المراجعات
- تصدير المراجعات

### 5. نظام الإشعارات الذكي
- إشعارات تلقائية للإنجازات
- تنبيهات الأداء المنخفض
- توصيات لتحسين المتجر
- إشعارات المراجعات الجديدة

## البنية التقنية

### Models
- `StoreApplication`: طلبات إنشاء المتاجر
- `StoreAnalytics`: تحليلات المتجر
- `ProductAnalytics`: تحليلات المنتجات
- `StoreViewLog`: سجل مشاهدات المتجر
- `ProductViewLog`: سجل مشاهدات المنتجات
- `StoreNotification`: إشعارات المتجر
- `StoreFeedback`: آراء العملاء

### Services
- `StoreAnalyticsService`: خدمة التحليلات
- `NotificationService`: خدمة الإشعارات

### Views
- `StoreApplicationCreateView`: إنشاء طلب متجر
- `StoreOwnerDashboardView`: لوحة تحكم المالك
- `StoreAnalyticsView`: صفحة التحليلات
- `StoreFeedbackListView`: إدارة آراء العملاء

## التثبيت والإعداد

### 1. تثبيت المتطلبات الإضافية
```bash
pip install -r requirements_stores.txt
```

### 2. تطبيق Migrations
```bash
python manage.py makemigrations stores
python manage.py migrate
```

### 3. إنشاء Superuser
```bash
python manage.py createsuperuser
```

### 4. تشغيل الخادم مع التحديثات التلقائية
```bash
python run_with_analytics.py runserver
```

## Management Commands

### تحديث التحليلات
```bash
# تحديث جميع المتاجر
python manage.py update_store_analytics

# تحديث متجر محدد
python manage.py update_store_analytics --store-id 1

# إجبار التحديث
python manage.py update_store_analytics --force
```

### إنشاء الإشعارات التلقائية
```bash
# إنشاء جميع أنواع الإشعارات
python manage.py create_automated_notifications

# إنشاء نوع محدد من الإشعارات
python manage.py create_automated_notifications --notification-type performance

# لمتجر محدد
python manage.py create_automated_notifications --store-id 1
```

## API Endpoints

### Store Applications
- `POST /api/stores/applications/create/` - إنشاء طلب متجر
- `GET /api/stores/applications/my/` - عرض طلبي
- `GET /api/stores/applications/{id}/` - تفاصيل الطلب
- `POST /api/stores/applications/{id}/review/` - مراجعة الطلب (إدارة)

### Store Dashboard
- `GET /api/stores/dashboard/` - بيانات لوحة التحكم
- `GET /api/stores/analytics/` - تحليلات المتجر
- `GET /api/stores/analytics/report/` - تقرير التحليلات

### Notifications
- `GET /api/stores/notifications/` - قائمة الإشعارات
- `POST /api/stores/notifications/{id}/read/` - تحديد كمقروء
- `POST /api/stores/notifications/read-all/` - تحديد الكل كمقروء

### Feedback
- `GET /api/stores/feedback/` - قائمة آراء العملاء
- `POST /api/stores/{slug}/feedback/create/` - إضافة رأي
- `PATCH /api/stores/feedback/{id}/respond/` - الرد على رأي

### Analytics Tracking
- `POST /api/stores/track/store/{slug}/view/` - تتبع مشاهدة متجر
- `POST /api/stores/track/product/{id}/view/` - تتبع مشاهدة منتج

## Frontend Integration

### الصفحات
- `/store/apply` - تطبيق إنشاء متجر
- `/store/dashboard` - لوحة تحكم المالك
- `/store/analytics` - صفحة التحليلات
- `/store/feedback` - إدارة آراء العملاء
- `/stores/{slug}/feedback` - صفحة آراء العملاء للعملاء

### الخدمات
- `storeService` - خدمة API للمتاجر
- تتبع تلقائي للمشاهدات
- إدارة الإشعارات في الوقت الفعلي

## الأمان والصلاحيات

### صلاحيات المستخدمين
- **العملاء**: تقديم طلب متجر، ترك آراء
- **أصحاب المتاجر**: إدارة متجرهم، عرض التحليلات، الرد على الآراء
- **الإدارة**: مراجعة طلبات المتاجر، إدارة النظام

### حماية البيانات
- تشفير المستندات المرفوعة
- تحقق من صحة البيانات
- حماية من CSRF و XSS
- تحديد معدل الطلبات

## المراقبة والصيانة

### Logging
- تسجيل جميع العمليات المهمة
- مراقبة الأخطاء والاستثناءات
- تتبع الأداء

### النسخ الاحتياطي
- نسخ احتياطية يومية للبيانات
- حفظ المستندات في مواقع متعددة

### الأداء
- فهرسة قاعدة البيانات
- تخزين مؤقت للتحليلات
- ضغط الصور والمستندات

## التطوير المستقبلي

### الميزات المخططة
- تكامل مع أنظمة الدفع
- تقارير مالية متقدمة
- نظام المخزون
- تطبيق الهاتف المحمول
- ذكاء اصطناعي للتوصيات

### التحسينات التقنية
- استخدام WebSockets للتحديثات الفورية
- تحسين الأداء باستخدام Redis
- إضافة Elasticsearch للبحث المتقدم
- تطبيق Docker للنشر

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- البريد الإلكتروني: support@bestonclick.com
- الوثائق: docs.bestonclick.com
- GitHub Issues: github.com/bestonclick/issues