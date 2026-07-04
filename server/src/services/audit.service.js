const { AuditLog } = require('../models');

async function log(userId, action, targetType, targetId, detail = null, ipAddress = '127.0.0.1') {
  return AuditLog.create({
    user_id: userId || null,
    action,
    target_type: targetType,
    target_id: String(targetId),
    detail: detail || null,
    ip_address: ipAddress || '127.0.0.1'
  });
}

module.exports = { log };
