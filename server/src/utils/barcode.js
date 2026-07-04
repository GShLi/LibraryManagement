function formatToday() {
  const d = new Date();
  return d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
}

async function generateReaderNo(db) {
  const today = formatToday();
  const prefix = `R-${today}-`;
  const result = await db.sequelize.query(
    `SELECT MAX(reader_no) as max_no FROM readers WHERE reader_no LIKE '${prefix}%'`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  const maxSeq = result[0]?.max_no
    ? parseInt(result[0].max_no.slice(-5), 10)
    : 0;
  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`;
}

async function generateBarcode(db) {
  const today = formatToday();
  const prefix = `BC-${today}-`;
  const result = await db.sequelize.query(
    `SELECT MAX(barcode) as max_bc FROM book_copy WHERE barcode LIKE '${prefix}%'`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  const maxSeq = result[0]?.max_bc
    ? parseInt(result[0].max_bc.slice(-5), 10)
    : 0;
  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`;
}

async function generateBarcodes(db, count) {
  const today = formatToday();
  const prefix = `BC-${today}-`;
  const result = await db.sequelize.query(
    `SELECT MAX(barcode) as max_bc FROM book_copy WHERE barcode LIKE '${prefix}%'`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  let maxSeq = result[0]?.max_bc
    ? parseInt(result[0].max_bc.slice(-5), 10)
    : 0;

  const barcodes = [];
  for (let i = 0; i < count; i++) {
    maxSeq++;
    barcodes.push(`${prefix}${String(maxSeq).padStart(5, '0')}`);
  }
  return barcodes;
}

module.exports = { generateReaderNo, generateBarcode, generateBarcodes };
