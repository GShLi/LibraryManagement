const { AppError, ValidationError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const response = {
      code: err.code,
      message: err.message,
      data: null
    };
    if (err instanceof ValidationError && err.errors.length > 0) {
      response.data = { errors: err.errors };
    }
    return res.status(err.statusCode).json(response);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      code: 40900,
      message: '资源冲突：数据已存在',
      data: null
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
    return res.status(422).json({
      code: 422,
      message: '请求参数校验失败',
      data: { errors }
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      code: 40000,
      message: '关联数据不存在，请检查引用',
      data: null
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    code: 50000,
    message: '服务器内部错误',
    data: null
  });
}

module.exports = errorHandler;
