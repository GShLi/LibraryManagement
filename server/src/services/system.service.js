const { SystemConfig, AuditLog, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const config = require('../config');
const path = require('path');
const fs = require('fs');

const cache = new Map();

async function loadConfigs() {
  const rows = await SystemConfig.findAll();
  cache.clear();
  for (const row of rows) {
    cache.set(row.config_key, row.config_value);
  }
}

function getConfig(key, defaultValue = null) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  return defaultValue;
}

function getConfigInt(key, defaultValue = 0) {
  const val = getConfig(key);
  if (val === null || val === undefined) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getConfigFloat(key, defaultValue = 0.0) {
  const val = getConfig(key);
  if (val === null || val === undefined) return defaultValue;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getAllConfigs() {
  const result = [];
  for (const [key, value] of cache.entries()) {
    result.push({ config_key: key, config_value: value });
  }
  return result;
}

async function updateConfigs(configs, userId) {
  const t = await sequelize.transaction();
  try {
    for (const [key, value] of Object.entries(configs)) {
      const existing = await SystemConfig.findOne({ where: { config_key: key }, transaction: t });
      if (existing) {
        await existing.update({ config_value: String(value), updated_by: userId }, { transaction: t });
      } else {
        await SystemConfig.create({
          config_key: key,
          config_value: String(value),
          updated_by: userId
        }, { transaction: t });
      }
      cache.set(key, String(value));
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function getLogs({ page = 1, pageSize = 20, action, userId, startDate, endDate }) {
  const where = {};
  if (action) where.action = action;
  if (userId) where.user_id = userId;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at[Op.gte] = new Date(startDate);
    if (endDate) where.created_at[Op.lte] = new Date(endDate + 'T23:59:59');
  }

  const offset = (page - 1) * pageSize;
  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'role'] }],
    order: [['created_at', 'DESC']],
    offset,
    limit: pageSize
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

function listBackups() {
  const backupDir = path.resolve(__dirname, '../../backup');
  if (!fs.existsSync(backupDir)) {
    return [];
  }
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
  return files.map((f, index) => {
    const filePath = path.join(backupDir, f);
    const stat = fs.statSync(filePath);
    return {
      id: index + 1,
      filename: f,
      size: stat.size,
      createdAt: stat.birthtime.toISOString()
    };
  });
}

async function createBackup() {
  const backupDir = path.resolve(__dirname, '../../backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const dbPath = path.resolve(__dirname, '../../', config.db.storage);
  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file not found');
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup_${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFile);
  fs.copyFileSync(dbPath, backupPath);
  return { filename: backupFile, path: backupPath };
}

async function restoreBackup(id) {
  const backups = listBackups();
  const backup = backups.find(b => b.id === id);
  if (!backup) {
    throw new Error('Backup not found');
  }
  const backupDir = path.resolve(__dirname, '../../backup');
  const backupPath = path.join(backupDir, backup.filename);
  const dbPath = path.resolve(__dirname, '../../', config.db.storage);
  fs.copyFileSync(backupPath, dbPath);
  // Reload configs after restore
  await loadConfigs();
  return { message: 'Database restored successfully. Please restart the server.' };
}

// Load configs on module init
loadConfigs().catch(err => {
  console.error('Failed to load system configs:', err.message);
});

module.exports = {
  loadConfigs,
  getConfig,
  getConfigInt,
  getConfigFloat,
  getAllConfigs,
  updateConfigs,
  getLogs,
  listBackups,
  createBackup,
  restoreBackup
};
