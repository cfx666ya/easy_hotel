-- 创建数据库
CREATE DATABASE IF NOT EXISTS hotel_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('merchant', 'admin') NOT NULL DEFAULT 'merchant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 酒店信息表
CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '酒店中文名称',
  name_en VARCHAR(100) DEFAULT '' COMMENT '酒店英文名称',
  address VARCHAR(255) NOT NULL COMMENT '详细地址',
  city VARCHAR(50) NOT NULL COMMENT '城市',
  province VARCHAR(50) NOT NULL COMMENT '省份',
  phone VARCHAR(20) COMMENT '联系电话',
  email VARCHAR(100) COMMENT '酒店邮箱',
  website VARCHAR(200) COMMENT '官网地址',
  open_date VARCHAR(20) COMMENT '开业时间',
  star_level TINYINT DEFAULT 0 COMMENT '星级 0-5',
  price_range_min DECIMAL(10,2) COMMENT '最低价格（元/晚）',
  price_range_max DECIMAL(10,2) COMMENT '最高价格（元/晚）',
  description TEXT COMMENT '酒店描述',
  facilities TEXT COMMENT 'JSON格式设施列表',
  images TEXT COMMENT 'JSON格式图片URL列表',
  room_types TEXT COMMENT 'JSON格式房型列表，含名称/价格/总房间数/描述/图片',
  nearby_info TEXT COMMENT '周边景点、交通、商场等信息',
  lat DECIMAL(10,7) DEFAULT NULL COMMENT '纬度，用于移动端地图定位',
  lng DECIMAL(10,7) DEFAULT NULL COMMENT '经度，用于移动端地图定位',
  status ENUM('draft', 'pending', 'approved', 'rejected', 'offline') DEFAULT 'pending' COMMENT '草稿/待审核/已发布/已拒绝/已下线',
  reject_reason TEXT COMMENT '审核拒绝原因',
  merchant_id INT NOT NULL COMMENT '所属商户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 默认管理员账号（密码：admin123）
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@hotel.com', 'admin')
ON DUPLICATE KEY UPDATE password='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

SELECT '数据库初始化完成！' as 结果;

-- 插入默认管理员账号 (密码: admin123)
-- 密码哈希由 bcryptjs hashSync('admin123', 10) 生成
-- INSERT IGNORE INTO users (username, password, email, role) VALUES 
-- ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@hotel.com', 'admin');
