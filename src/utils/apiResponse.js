class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, { data, total, page, pageSize }) {
    return res.status(200).json({
      success: true,
      data,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize),
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, error = null) {
    const response = {
      success: false,
      error: message,
    };
    if (error && process.env.NODE_ENV === 'development') {
      response.details = error;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
