function success(res, data = null, message = 'ok', statusCode = 200) {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data
  });
}

function created(res, data = null, message = '创建成功') {
  return res.status(201).json({
    code: 201,
    message,
    data
  });
}

function paginated(res, { total, page, pageSize, list }) {
  return res.status(200).json({
    code: 200,
    message: 'ok',
    data: { total, page, pageSize, list }
  });
}

function noContent(res) {
  return res.status(204).send();
}

module.exports = { success, created, paginated, noContent };
