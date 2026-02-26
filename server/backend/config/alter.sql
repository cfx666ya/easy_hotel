USE hotel_system;

-- 添加新字段（如果不存在）
ALTER TABLE hotels 
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(100) COMMENT '英文名称' AFTER name,
  ADD COLUMN IF NOT EXISTS open_date VARCHAR(20) COMMENT '开业时间' AFTER website,
  ADD COLUMN IF NOT EXISTS room_types TEXT COMMENT 'JSON格式房型列表' AFTER images,
  ADD COLUMN IF NOT EXISTS nearby_info TEXT COMMENT '周边景点交通信息' AFTER room_types;

SELECT '数据库字段更新成功！' as 结果;
