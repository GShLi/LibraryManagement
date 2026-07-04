-- ============================================================================
-- 图书管理系统 — 数据库初始化脚本
-- 数据库：SQLite 3 (≥ 3.35)
-- 字符集：UTF-8
-- 版本：v2.0
-- 日期：2026-07-04
-- ============================================================================

-- 1. 基础配置
-- ============================================================================
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -8000;
PRAGMA busy_timeout = 5000;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456;

-- 2. 建表（按依赖顺序创建）
-- ============================================================================

-- 2.1 用户表
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'reader',
    status          VARCHAR(20)  NOT NULL DEFAULT 'active',
    login_attempts  INTEGER      NOT NULL DEFAULT 0,
    locked_until    DATETIME              DEFAULT NULL,
    created_at      DATETIME     NOT NULL DEFAULT (datetime('now')),
    updated_at      DATETIME     NOT NULL DEFAULT (datetime('now')),
    deleted_at      DATETIME              DEFAULT NULL,
    CHECK (role IN ('admin', 'librarian', 'reader')),
    CHECK (status IN ('active', 'disabled', 'locked')),
    CHECK (length(username) >= 3 AND length(username) <= 50)
);

-- 2.2 读者信息表
CREATE TABLE IF NOT EXISTS readers (
    user_id          INTEGER      PRIMARY KEY,
    reader_no        VARCHAR(25)  NOT NULL UNIQUE,
    name             VARCHAR(50)  NOT NULL,
    phone            VARCHAR(20)  NOT NULL UNIQUE,
    email            VARCHAR(100)          DEFAULT NULL,
    reader_type      VARCHAR(20)  NOT NULL DEFAULT 'student',
    borrow_limit     INTEGER      NOT NULL DEFAULT 5,
    current_borrowed INTEGER      NOT NULL DEFAULT 0,
    status           VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at       DATETIME     NOT NULL DEFAULT (datetime('now')),
    updated_at       DATETIME     NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (reader_type IN ('student', 'teacher', 'staff', 'external')),
    CHECK (current_borrowed >= 0 AND current_borrowed <= borrow_limit),
    CHECK (status IN ('active', 'frozen', 'lost', 'disabled'))
);

-- 2.3 图书分类表
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER      PRIMARY KEY AUTOINCREMENT,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    parent_id   INTEGER              DEFAULT NULL,
    level       INTEGER      NOT NULL DEFAULT 1,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    CHECK (level >= 1)
);

-- 2.4 图书信息表
CREATE TABLE IF NOT EXISTS books (
    id               INTEGER       PRIMARY KEY AUTOINCREMENT,
    isbn             VARCHAR(20)   NOT NULL UNIQUE,
    title            VARCHAR(200)  NOT NULL,
    author           VARCHAR(100)  NOT NULL,
    publisher        VARCHAR(100)  NOT NULL,
    publish_date     DATE          NOT NULL,
    category_id      INTEGER       NOT NULL,
    category_code    VARCHAR(20)   NOT NULL,
    category_name    VARCHAR(100)           DEFAULT NULL,
    price            DECIMAL(10,2) NOT NULL,
    pages            INTEGER                DEFAULT NULL,
    language         VARCHAR(20)            DEFAULT '中文',
    edition          VARCHAR(50)            DEFAULT NULL,
    keywords         TEXT                   DEFAULT NULL,
    description      TEXT                   DEFAULT NULL,
    cover_url        VARCHAR(500)           DEFAULT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'active',
    total_copies     INTEGER       NOT NULL DEFAULT 0,
    available_copies INTEGER       NOT NULL DEFAULT 0,
    created_at       DATETIME      NOT NULL DEFAULT (datetime('now')),
    updated_at       DATETIME      NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    CHECK (total_copies >= 0),
    CHECK (available_copies >= 0 AND available_copies <= total_copies),
    CHECK (status IN ('active', 'withdrawn')),
    CHECK (price > 0)
);

-- 2.5 图书副本表
CREATE TABLE IF NOT EXISTS book_copy (
    id          INTEGER      PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER      NOT NULL,
    barcode     VARCHAR(30)  NOT NULL UNIQUE,
    status      VARCHAR(20)  NOT NULL DEFAULT 'stock',
    location    VARCHAR(100)          DEFAULT NULL,
    condition   VARCHAR(20)           DEFAULT 'new',
    created_at  DATETIME     NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME     NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CHECK (status IN ('stock', 'available', 'borrowed', 'withdrawn')),
    CHECK (condition IN ('new', 'good', 'fair', 'damaged'))
);

-- 2.6 借阅记录表
CREATE TABLE IF NOT EXISTS borrow (
    id            INTEGER      PRIMARY KEY AUTOINCREMENT,
    reader_id     INTEGER      NOT NULL,
    copy_id       INTEGER      NOT NULL,
    operator_id   INTEGER      NOT NULL,
    borrow_date   DATETIME     NOT NULL DEFAULT (datetime('now')),
    due_date      DATE         NOT NULL,
    return_date   DATETIME              DEFAULT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'borrowing',
    renew_count   INTEGER      NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME     NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (reader_id)   REFERENCES readers(user_id),
    FOREIGN KEY (copy_id)     REFERENCES book_copy(id),
    FOREIGN KEY (operator_id) REFERENCES users(id),
    CHECK (status IN ('borrowing', 'returned', 'overdue')),
    CHECK (renew_count >= 0 AND renew_count <= 2),
    CHECK (due_date >= date(borrow_date))
);

-- 2.7 罚款记录表
CREATE TABLE IF NOT EXISTS fine (
    id            INTEGER       PRIMARY KEY AUTOINCREMENT,
    borrow_id     INTEGER       NOT NULL UNIQUE,
    reader_id     INTEGER       NOT NULL,
    overdue_days  INTEGER       NOT NULL,
    amount        DECIMAL(10,2) NOT NULL,
    reason        VARCHAR(50)   NOT NULL DEFAULT 'overdue',
    status        VARCHAR(20)   NOT NULL DEFAULT 'unpaid',
    paid_at       DATETIME               DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (borrow_id) REFERENCES borrow(id) ON DELETE CASCADE,
    FOREIGN KEY (reader_id) REFERENCES readers(user_id),
    CHECK (amount > 0),
    CHECK (overdue_days > 0),
    CHECK (status IN ('unpaid', 'paid')),
    CHECK (reason IN ('overdue', 'lost', 'damaged'))
);

-- 2.8 预约记录表
CREATE TABLE IF NOT EXISTS reserve (
    id            INTEGER     PRIMARY KEY AUTOINCREMENT,
    reader_id     INTEGER     NOT NULL,
    book_id       INTEGER     NOT NULL,
    copy_id       INTEGER              DEFAULT NULL,
    reserve_date  DATETIME    NOT NULL DEFAULT (datetime('now')),
    expire_date   DATE        NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'waiting',
    created_at    DATETIME    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (reader_id) REFERENCES readers(user_id),
    FOREIGN KEY (book_id)   REFERENCES books(id),
    FOREIGN KEY (copy_id)   REFERENCES book_copy(id),
    CHECK (status IN ('waiting', 'fulfilled', 'cancelled', 'expired')),
    CHECK (expire_date >= date(reserve_date))
);

-- 2.9 操作日志表
CREATE TABLE IF NOT EXISTS audit_log (
    id            INTEGER      PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER               DEFAULT NULL,
    action        VARCHAR(50)  NOT NULL,
    target_type   VARCHAR(50)  NOT NULL,
    target_id     VARCHAR(100) NOT NULL,
    detail        TEXT                  DEFAULT NULL,
    ip_address    VARCHAR(45)  NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2.10 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id            INTEGER       PRIMARY KEY AUTOINCREMENT,
    config_key    VARCHAR(50)   NOT NULL UNIQUE,
    config_value  TEXT          NOT NULL,
    description   VARCHAR(200)           DEFAULT NULL,
    updated_at    DATETIME      NOT NULL DEFAULT (datetime('now')),
    updated_by    INTEGER       NOT NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 3. 索引（在表创建后集中建立，确保所有索引生效）
-- ============================================================================

-- users 表索引
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- readers 表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_readers_reader_no ON readers(reader_no);
CREATE UNIQUE INDEX IF NOT EXISTS idx_readers_phone ON readers(phone);
CREATE INDEX IF NOT EXISTS idx_readers_status ON readers(status);
CREATE INDEX IF NOT EXISTS idx_readers_name ON readers(name);

-- categories 表索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- books 表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category_code ON books(category_code);
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_publish_date ON books(publish_date);

-- book_copy 表索引
CREATE INDEX IF NOT EXISTS idx_book_copy_book_id ON book_copy(book_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_copy_barcode ON book_copy(barcode);
CREATE INDEX IF NOT EXISTS idx_book_copy_status ON book_copy(status);

-- borrow 表索引
CREATE INDEX IF NOT EXISTS idx_borrow_reader_id ON borrow(reader_id);
CREATE INDEX IF NOT EXISTS idx_borrow_copy_id ON borrow(copy_id);
CREATE INDEX IF NOT EXISTS idx_borrow_status ON borrow(status);
CREATE INDEX IF NOT EXISTS idx_borrow_due_date ON borrow(due_date);
CREATE INDEX IF NOT EXISTS idx_borrow_borrow_date ON borrow(borrow_date);
CREATE INDEX IF NOT EXISTS idx_borrow_reader_status ON borrow(reader_id, status);

-- fine 表索引
CREATE INDEX IF NOT EXISTS idx_fine_reader_id ON fine(reader_id);
CREATE INDEX IF NOT EXISTS idx_fine_status ON fine(status);

-- reserve 表索引
CREATE INDEX IF NOT EXISTS idx_reserve_reader_id ON reserve(reader_id);
CREATE INDEX IF NOT EXISTS idx_reserve_book_id ON reserve(book_id);
CREATE INDEX IF NOT EXISTS idx_reserve_status ON reserve(status);
CREATE INDEX IF NOT EXISTS idx_reserve_expire_date ON reserve(expire_date);
CREATE INDEX IF NOT EXISTS idx_reserve_reader_book ON reserve(reader_id, book_id);

-- audit_log 表索引
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_type ON audit_log(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_composite ON audit_log(user_id, action, created_at);

-- 4. 视图
-- ============================================================================

-- 4.1 借阅详情视图
CREATE VIEW IF NOT EXISTS v_borrow_detail AS
SELECT
    b.id            AS borrow_id,
    r.user_id       AS reader_user_id,
    r.reader_no,
    r.name          AS reader_name,
    r.phone         AS reader_phone,
    bk.id           AS book_id,
    bk.title        AS book_title,
    bk.author       AS book_author,
    bk.isbn,
    bk.publisher,
    bk.price,
    bc.id           AS copy_id,
    bc.barcode,
    bc.location,
    u.username      AS operator_name,
    b.borrow_date,
    b.due_date,
    b.return_date,
    b.status        AS borrow_status,
    b.renew_count,
    CASE WHEN b.status IN ('borrowing','overdue') AND b.due_date < date('now')
         THEN CAST(julianday('now') - julianday(b.due_date) AS INTEGER)
         ELSE 0
    END AS overdue_days,
    f.id            AS fine_id,
    f.amount        AS fine_amount,
    f.status        AS fine_status,
    b.created_at,
    b.updated_at
FROM borrow b
JOIN readers r     ON b.reader_id = r.user_id
JOIN book_copy bc  ON b.copy_id = bc.id
JOIN books bk      ON bc.book_id = bk.id
JOIN users u       ON b.operator_id = u.id
LEFT JOIN fine f   ON b.id = f.borrow_id;

-- 4.2 馆藏统计视图
CREATE VIEW IF NOT EXISTS v_inventory_stats AS
SELECT
    bk.id                   AS book_id,
    bk.isbn,
    bk.title,
    bk.author,
    bk.publisher,
    bk.category_code,
    bk.category_name,
    bk.price,
    bk.total_copies,
    bk.available_copies,
    COUNT(CASE WHEN bc.status = 'borrowed'  THEN 1 END) AS borrowed_count,
    COUNT(CASE WHEN bc.status = 'withdrawn' THEN 1 END) AS withdrawn_count,
    COUNT(CASE WHEN bc.status = 'stock'     THEN 1 END) AS stock_count,
    COUNT(CASE WHEN bc.status = 'available' THEN 1 END) AS available_detail_count,
    bk.status               AS book_status,
    bk.created_at,
    bk.updated_at
FROM books bk
LEFT JOIN book_copy bc ON bk.id = bc.book_id
GROUP BY bk.id;

-- 4.3 读者借阅概览视图
CREATE VIEW IF NOT EXISTS v_reader_overview AS
SELECT
    r.user_id,
    r.reader_no,
    r.name,
    r.phone,
    r.reader_type,
    r.borrow_limit,
    r.current_borrowed,
    r.status                 AS reader_status,
    COUNT(CASE WHEN b.status = 'borrowing' THEN 1 END)    AS active_borrows,
    COUNT(CASE WHEN b.status = 'overdue'   THEN 1 END)    AS overdue_borrows,
    COUNT(CASE WHEN f.status  = 'unpaid'   THEN 1 END)    AS unpaid_fines,
    COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.amount END), 0) AS total_unpaid_amount,
    u.username,
    u.status                 AS user_status,
    u.created_at,
    r.created_at             AS registered_at
FROM readers r
JOIN users u          ON r.user_id = u.id
LEFT JOIN borrow b   ON r.user_id = b.reader_id
LEFT JOIN fine f     ON r.user_id = f.reader_id
WHERE u.deleted_at IS NULL
GROUP BY r.user_id;

-- 5. 初始化数据
-- ============================================================================

-- 5.1 默认管理员
-- 密码: admin123 (bcrypt, salt rounds: 10)
-- 注意：生产环境应使用环境变量传入初始密码
INSERT OR IGNORE INTO users (id, username, password, role, status, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 'active', datetime('now'), datetime('now'));

-- 5.2 中图法分类数据

-- 一级分类
INSERT OR IGNORE INTO categories (id, code, name, parent_id, level, sort_order, created_at) VALUES
(1,  'A', '马克思主义、列宁主义、毛泽东思想、邓小平理论', NULL, 1, 1, datetime('now')),
(2,  'B', '哲学、宗教', NULL, 1, 2, datetime('now')),
(3,  'C', '社会科学总论', NULL, 1, 3, datetime('now')),
(4,  'D', '政治、法律', NULL, 1, 4, datetime('now')),
(5,  'E', '军事', NULL, 1, 5, datetime('now')),
(6,  'F', '经济', NULL, 1, 6, datetime('now')),
(7,  'G', '文化、科学、教育、体育', NULL, 1, 7, datetime('now')),
(8,  'H', '语言、文字', NULL, 1, 8, datetime('now')),
(9,  'I', '文学', NULL, 1, 9, datetime('now')),
(10, 'J', '艺术', NULL, 1, 10, datetime('now')),
(11, 'K', '历史、地理', NULL, 1, 11, datetime('now')),
(12, 'N', '自然科学总论', NULL, 1, 12, datetime('now')),
(13, 'O', '数理科学和化学', NULL, 1, 13, datetime('now')),
(14, 'P', '天文学、地球科学', NULL, 1, 14, datetime('now')),
(15, 'Q', '生物科学', NULL, 1, 15, datetime('now')),
(16, 'R', '医药、卫生', NULL, 1, 16, datetime('now')),
(17, 'S', '农业科学', NULL, 1, 17, datetime('now')),
(18, 'T', '工业技术', NULL, 1, 18, datetime('now')),
(19, 'U', '交通运输', NULL, 1, 19, datetime('now')),
(20, 'V', '航空、航天', NULL, 1, 20, datetime('now')),
(21, 'X', '环境科学、安全科学', NULL, 1, 21, datetime('now')),
(22, 'Z', '综合性图书', NULL, 1, 22, datetime('now'));

-- T 工业技术 — 二级分类
INSERT OR IGNORE INTO categories (id, code, name, parent_id, level, sort_order, created_at) VALUES
(23, 'TB', '一般工业技术',       18, 2, 1,  datetime('now')),
(24, 'TD', '矿业工程',           18, 2, 2,  datetime('now')),
(25, 'TE', '石油、天然气工业',    18, 2, 3,  datetime('now')),
(26, 'TF', '冶金工业',           18, 2, 4,  datetime('now')),
(27, 'TG', '金属学与金属工艺',    18, 2, 5,  datetime('now')),
(28, 'TH', '机械、仪表工业',      18, 2, 6,  datetime('now')),
(29, 'TJ', '武器工业',           18, 2, 7,  datetime('now')),
(30, 'TK', '能源与动力工程',      18, 2, 8,  datetime('now')),
(31, 'TL', '原子能技术',         18, 2, 9,  datetime('now')),
(32, 'TM', '电工技术',           18, 2, 10, datetime('now')),
(33, 'TN', '电子技术、通信技术',  18, 2, 11, datetime('now')),
(34, 'TP', '自动化技术、计算机技术', 18, 2, 12, datetime('now')),
(35, 'TQ', '化学工业',           18, 2, 13, datetime('now')),
(36, 'TS', '轻工业、手工业',      18, 2, 14, datetime('now')),
(37, 'TU', '建筑科学',           18, 2, 15, datetime('now')),
(38, 'TV', '水利工程',           18, 2, 16, datetime('now'));

-- 5.3 系统配置初始值
INSERT OR IGNORE INTO system_config (id, config_key, config_value, description, updated_at, updated_by) VALUES
(1,  'max_borrow_count_student', '5',   '学生最大借阅册数',          datetime('now'), 1),
(2,  'max_borrow_count_teacher', '10',  '教师最大借阅册数',          datetime('now'), 1),
(3,  'max_borrow_count_staff',   '5',   '职工最大借阅册数',          datetime('now'), 1),
(4,  'max_borrow_count_external','3',   '外部读者最大借阅册数',      datetime('now'), 1),
(5,  'borrow_duration_days',     '30',  '单次借阅天数',              datetime('now'), 1),
(6,  'max_renew_count',          '2',   '最大续借次数',              datetime('now'), 1),
(7,  'renew_duration_days',      '30',  '续借天数',                  datetime('now'), 1),
(8,  'overdue_fine_rate',        '0.1', '逾期费率（元/天）',         datetime('now'), 1),
(9,  'fine_max_multiple',        '2.0', '罚款上限（定价倍数）',      datetime('now'), 1),
(10, 'reserve_expire_days',      '3',   '预约保留天数',              datetime('now'), 1),
(11, 'login_max_attempts',       '5',   '连续登录失败锁定次数',      datetime('now'), 1),
(12, 'login_lock_minutes',       '15',  '锁定持续分钟数',            datetime('now'), 1),
(13, 'overdue_freeze_days',      '30',  '逾期自动冻结天数',          datetime('now'), 1);

-- 5.4 示例图书数据
INSERT OR IGNORE INTO books (id, isbn, title, author, publisher, publish_date, category_id, category_code, category_name,
                              price, pages, language, edition, keywords, description, status, total_copies, available_copies)
VALUES
(1, '9787115487561', 'JavaScript 高级程序设计（第4版）', 'Matt Frisbie', '人民邮电出版社', '2020-12-01',
  34, 'TP', '自动化技术、计算机技术',
  129.00, 900, '中文', '第4版',
  '["JavaScript","Web开发","前端"]',
  '本书是JavaScript经典图书的第4版，全面深入地介绍了JavaScript的核心概念与高级特性。',
  'active', 5, 5),
(2, '9787115546086', '深入浅出 Node.js', '朴灵', '人民邮电出版社', '2023-06-01',
  34, 'TP', '自动化技术、计算机技术',
  89.00, 450, '中文', '第1版',
  '["Node.js","后端开发","JavaScript"]',
  '本书详细介绍了Node.js的核心技术原理与应用实践。',
  'active', 3, 3),
(3, '9787020002207', '红楼梦', '曹雪芹', '人民文学出版社', '1996-12-01',
  9, 'I', '文学',
  59.70, 1606, '中文', '第3版',
  '["古典文学","四大名著","小说"]',
  '中国古典四大名著之一，以贾宝玉、林黛玉、薛宝钗的爱情婚姻悲剧为主线。',
  'active', 8, 8),
(4, '9787544253994', '三体', '刘慈欣', '重庆出版社', '2008-01-01',
  9, 'I', '文学',
  23.00, 302, '中文', '第1版',
  '["科幻","中国科幻","刘慈欣"]',
  '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。',
  'active', 4, 4),
(5, '9787544270878', '百年孤独', '加西亚·马尔克斯', '南海出版公司', '2011-06-01',
  9, 'I', '文学',
  39.50, 360, '中文', '第1版',
  '["拉美文学","魔幻现实主义","马尔克斯"]',
  '《百年孤独》是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事。',
  'active', 6, 6);

-- 5.5 示例副本数据
INSERT OR IGNORE INTO book_copy (book_id, barcode, status, location, condition, created_at, updated_at) VALUES
-- JavaScript 高级程序设计 (5 copies)
(1, 'BC-20260704-00001', 'available', 'A区-3排-5层', 'new', datetime('now'), datetime('now')),
(1, 'BC-20260704-00002', 'available', 'A区-3排-5层', 'new', datetime('now'), datetime('now')),
(1, 'BC-20260704-00003', 'available', 'A区-3排-5层', 'new', datetime('now'), datetime('now')),
(1, 'BC-20260704-00004', 'available', 'A区-3排-5层', 'good', datetime('now'), datetime('now')),
(1, 'BC-20260704-00005', 'available', 'A区-3排-5层', 'good', datetime('now'), datetime('now')),
-- 深入浅出 Node.js (3 copies)
(2, 'BC-20260704-00006', 'available', 'A区-3排-6层', 'new', datetime('now'), datetime('now')),
(2, 'BC-20260704-00007', 'available', 'A区-3排-6层', 'new', datetime('now'), datetime('now')),
(2, 'BC-20260704-00008', 'available', 'A区-3排-6层', 'good', datetime('now'), datetime('now')),
-- 红楼梦 (8 copies)
(3, 'BC-20260704-00009', 'available', 'B区-1排-2层', 'new', datetime('now'), datetime('now')),
(3, 'BC-20260704-00010', 'available', 'B区-1排-2层', 'new', datetime('now'), datetime('now')),
(3, 'BC-20260704-00011', 'available', 'B区-1排-2层', 'new', datetime('now'), datetime('now')),
(3, 'BC-20260704-00012', 'available', 'B区-1排-2层', 'good', datetime('now'), datetime('now')),
(3, 'BC-20260704-00013', 'available', 'B区-1排-2层', 'new', datetime('now'), datetime('now')),
(3, 'BC-20260704-00014', 'available', 'B区-1排-2层', 'new', datetime('now'), datetime('now')),
(3, 'BC-20260704-00015', 'available', 'B区-1排-2层', 'new', datetime('now'), datetime('now')),
(3, 'BC-20260704-00016', 'available', 'B区-1排-2层', 'good', datetime('now'), datetime('now')),
-- 三体 (4 copies)
(4, 'BC-20260704-00017', 'available', 'B区-2排-1层', 'new', datetime('now'), datetime('now')),
(4, 'BC-20260704-00018', 'available', 'B区-2排-1层', 'new', datetime('now'), datetime('now')),
(4, 'BC-20260704-00019', 'available', 'B区-2排-1层', 'good', datetime('now'), datetime('now')),
(4, 'BC-20260704-00020', 'available', 'B区-2排-1层', 'good', datetime('now'), datetime('now')),
-- 百年孤独 (6 copies)
(5, 'BC-20260704-00021', 'available', 'B区-2排-2层', 'new', datetime('now'), datetime('now')),
(5, 'BC-20260704-00022', 'available', 'B区-2排-2层', 'new', datetime('now'), datetime('now')),
(5, 'BC-20260704-00023', 'available', 'B区-2排-2层', 'new', datetime('now'), datetime('now')),
(5, 'BC-20260704-00024', 'available', 'B区-2排-2层', 'good', datetime('now'), datetime('now')),
(5, 'BC-20260704-00025', 'available', 'B区-2排-2层', 'good', datetime('now'), datetime('now')),
(5, 'BC-20260704-00026', 'available', 'B区-2排-2层', 'new', datetime('now'), datetime('now'));

-- ============================================================================
-- 初始化完成
-- 总计 10 张表，40 个索引，3 个视图
-- ============================================================================
