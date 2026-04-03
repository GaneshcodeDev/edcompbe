const crypto = require('crypto');
const ActivityLog = require('../models/ActivityLog');

/**
 * Audit Logger - Universal activity tracking
 *
 * Usage in controllers:
 *   const { logAction } = require('../services/auditLogger');
 *
 *   // Simple action
 *   await logAction(req, 'create', 'employees', 'employee', employee.id, employee.first_name + ' ' + employee.last_name,
 *     `Created employee ${employee.first_name} ${employee.last_name} (${employee.employee_code})`
 *   );
 *
 *   // Update with before/after
 *   await logAction(req, 'update', 'employees', 'employee', employee.id, name, description, oldValues, newValues);
 */

async function logAction(req, action, module, entityType, entityId, entityName, description, previousValues, newValues) {
  try {
    await ActivityLog.create({
      id: crypto.randomUUID(),
      tenant_id: req.tenantId || req.user?.tenantId || null,
      user_id: req.user?.id || null,
      user_name: req.user?.fullName || req.user?.full_name || null,
      user_role: req.user?.role || null,
      action,
      module,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_name: entityName || null,
      description,
      previous_values: previousValues ? JSON.stringify(previousValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: req.ip || req.connection?.remoteAddress || null,
      user_agent: req.get?.('User-Agent') || null,
    });
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('Audit log error:', err.message);
  }
}

/**
 * Helper to extract changed fields between old and new objects
 * Returns { field: { old: x, new: y } } for fields that changed
 */
function getChanges(oldObj, newObj, fields) {
  const changes = {};
  for (const field of fields) {
    const oldVal = oldObj[field];
    const newVal = newObj[field];
    if (oldVal !== newVal && newVal !== undefined) {
      changes[field] = { old: oldVal, new: newVal };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}

module.exports = { logAction, getChanges };
