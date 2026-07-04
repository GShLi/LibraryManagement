const { sequelize, Borrow } = require('../models');

async function checkOverdue() {
  try {
    const [results] = await sequelize.query(`
      UPDATE borrow
      SET status = 'overdue', updated_at = datetime('now')
      WHERE status = 'borrowing'
        AND due_date < date('now')
    `);
    console.log(`Overdue check complete: ${results} records marked overdue.`);
  } catch (err) {
    console.error('Overdue check failed:', err);
  }
}

async function freezeReaders() {
  try {
    const config = await sequelize.query(
      `SELECT config_value FROM system_config WHERE config_key = 'overdue_freeze_days'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const freezeDays = parseInt(config[0]?.config_value || '30', 10);

    const [results] = await sequelize.query(`
      UPDATE readers
      SET status = 'frozen', updated_at = datetime('now')
      WHERE status = 'active'
        AND user_id IN (
          SELECT DISTINCT b.reader_id
          FROM borrow b
          WHERE b.status = 'overdue'
            AND CAST(julianday('now') - julianday(b.due_date) AS INTEGER) >= :freezeDays
        )
    `, { replacements: { freezeDays } });
    console.log(`Reader freeze check complete: ${results} readers frozen.`);
  } catch (err) {
    console.error('Reader freeze check failed:', err);
  }
}

async function expireReservations() {
  try {
    const [results] = await sequelize.query(`
      UPDATE reserve
      SET status = 'expired'
      WHERE status = 'waiting'
        AND expire_date < date('now')
    `);
    console.log(`Reservation expiry check complete: ${results} reservations expired.`);
  } catch (err) {
    console.error('Reservation expiry check failed:', err);
  }
}

async function runAll() {
  console.log('Starting scheduled tasks...');
  await checkOverdue();
  await freezeReaders();
  await expireReservations();
  console.log('All scheduled tasks complete.');
}

if (require.main === module) {
  runAll()
    .then(() => sequelize.close())
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { checkOverdue, freezeReaders, expireReservations, runAll };
