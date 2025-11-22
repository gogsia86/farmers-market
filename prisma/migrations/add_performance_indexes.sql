-- ============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Date: November 15, 2025
-- Purpose: Add critical indexes for HP OMEN performance optimization
-- ============================================================================

-- ============================================================================
-- USER TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Composite index for common user queries (role + status + email)
CREATE INDEX IF NOT EXISTS idx_users_role_status_email ON users(role, status, email);

-- Index for login performance (email + password lookup)
CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status) WHERE status = 'ACTIVE';

-- Index for admin queries (role-based filtering)
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users(role, created_at DESC);

-- Partial index for verified users
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(id) WHERE email_verified = true;

-- ============================================================================
-- FARM TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Composite index for farm listing queries
CREATE INDEX IF NOT EXISTS idx_farms_status_verification ON farms(status, verification_status, created_at DESC);

-- Geographic index for location-based searches (if using PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_farms_location ON farms USING GIST(location);

-- Index for farm owner queries
CREATE INDEX IF NOT EXISTS idx_farms_owner_status ON farms(owner_id, status);

-- Full-text search index for farm name and description
CREATE INDEX IF NOT EXISTS idx_farms_search ON farms USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- PRODUCT TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Composite index for product catalog queries
CREATE INDEX IF NOT EXISTS idx_products_farm_status_category ON products(farm_id, status, category, created_at DESC);

-- Index for active products only (partial index)
CREATE INDEX IF NOT EXISTS idx_products_active ON products(farm_id, category, price) WHERE status = 'ACTIVE';

-- Full-text search for products
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Index for price range queries
CREATE INDEX IF NOT EXISTS idx_products_price ON products(category, price) WHERE status = 'ACTIVE';

-- Index for inventory management
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(farm_id, stock_quantity) WHERE status = 'ACTIVE';

-- ============================================================================
-- ORDER TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Composite index for order management
CREATE INDEX IF NOT EXISTS idx_orders_farm_status ON orders(farm_id, status, created_at DESC);

-- Composite index for customer orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status, created_at DESC);

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status, created_at DESC);

-- Index for fulfillment tracking
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status, fulfillment_date);

-- Index for order analytics (date-based queries)
CREATE INDEX IF NOT EXISTS idx_orders_analytics ON orders(farm_id, created_at DESC, total_amount);

-- ============================================================================
-- CART TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Index for active cart items
CREATE INDEX IF NOT EXISTS idx_cart_user_active ON cart_items(user_id, created_at DESC);

-- Index for product availability in carts
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id, user_id);

-- ============================================================================
-- REVIEW TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Composite index for review queries
CREATE INDEX IF NOT EXISTS idx_reviews_farm_status ON reviews(farm_id, status, created_at DESC);

-- Index for product reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, status, rating);

-- Index for user reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC);

-- Index for rating calculations
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(farm_id, rating) WHERE status = 'APPROVED';

-- ============================================================================
-- NOTIFICATION TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- Index for notification type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(user_id, type, created_at DESC);

-- Partial index for active notifications
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(user_id, created_at DESC) WHERE is_deleted = false;

-- ============================================================================
-- MESSAGE TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read, created_at DESC) WHERE is_read = false;

-- ============================================================================
-- QUALITY ISSUE TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Index for open quality issues
CREATE INDEX IF NOT EXISTS idx_quality_issues_open ON quality_issues(farm_id, status, created_at DESC) WHERE status IN ('OPEN', 'IN_REVIEW');

-- Index for customer quality issues
CREATE INDEX IF NOT EXISTS idx_quality_issues_customer ON quality_issues(customer_id, status, created_at DESC);

-- ============================================================================
-- PAYMENT TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Index for payment tracking
CREATE INDEX IF NOT EXISTS idx_payments_order_status ON payments(order_id, status, created_at DESC);

-- Index for payment method analytics
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method, status, created_at DESC);

-- Index for successful payments
CREATE INDEX IF NOT EXISTS idx_payments_successful ON payments(farm_id, created_at DESC, amount) WHERE status = 'PAID';

-- ============================================================================
-- ANALYTICS & REPORTING INDEXES
-- ============================================================================

-- Index for farm revenue analytics
CREATE INDEX IF NOT EXISTS idx_analytics_farm_revenue ON orders(farm_id, created_at, total_amount)
    WHERE payment_status = 'PAID' AND status NOT IN ('CANCELLED');

-- Index for product sales analytics
CREATE INDEX IF NOT EXISTS idx_analytics_product_sales ON order_items(product_id, created_at, total_price);

-- Index for customer analytics
CREATE INDEX IF NOT EXISTS idx_analytics_customer ON orders(customer_id, created_at, total_amount)
    WHERE payment_status = 'PAID';

-- ============================================================================
-- VACUUM ANALYZE for statistics update
-- ============================================================================

VACUUM ANALYZE users;
VACUUM ANALYZE farms;
VACUUM ANALYZE products;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;
VACUUM ANALYZE cart_items;
VACUUM ANALYZE reviews;
VACUUM ANALYZE notifications;
VACUUM ANALYZE messages;
VACUUM ANALYZE payments;
VACUUM ANALYZE quality_issues;

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES (for validation)
-- ============================================================================

-- Check index usage statistics
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- Check table sizes
-- SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
