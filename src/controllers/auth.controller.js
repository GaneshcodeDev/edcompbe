const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User, Tenant } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

// Generate JWT Token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenant_id, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

// Generate Refresh Token
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    jwtConfig.secret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
}

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw ApiError.validation('Username and password are required');
    }

    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      await logAction({ ip: req.ip, get: req.get.bind(req) }, 'login_failed', 'auth', 'user', null, username, `Failed login attempt for: ${username}`);
      throw new ApiError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated. Contact admin.');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAction({ ip: req.ip, get: req.get.bind(req) }, 'login_failed', 'auth', 'user', null, username, `Failed login attempt for: ${username}`);
      throw new ApiError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check tenant is active
    const tenant = await Tenant.findByPk(user.tenant_id);
    if (!tenant || (!tenant.is_active && user.role !== 'super_admin')) {
      throw new ApiError('Tenant account is inactive', 403, 'TENANT_INACTIVE');
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    req.user = { id: user.id, fullName: user.full_name, role: user.role, tenantId: user.tenant_id };
    req.tenantId = user.tenant_id;
    await logAction(req, 'login', 'auth', 'user', user.id, user.full_name, `User ${user.username} logged in`);

    return ApiResponse.success(res, {
      token,
      refreshToken,
      user: user.toSafeJSON(),
      expiresAt: expiresAt.toISOString(),
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'name', 'code', 'config'] }],
    });

    if (!user) throw ApiError.notFound('User not found');

    return ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw ApiError.validation('Refresh token required');

    const decoded = jwt.verify(refreshToken, jwtConfig.secret);
    if (decoded.type !== 'refresh') throw ApiError.unauthorized('Invalid refresh token');

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) throw ApiError.unauthorized('User not found or inactive');

    const newToken = generateToken(user);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return ApiResponse.success(res, { token: newToken, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  // In a production app, you'd invalidate the token (blacklist or remove from DB)
  await logAction(req, 'logout', 'auth', 'user', req.user?.id, null, `User logged out`);
  return ApiResponse.success(res, {}, 'Logged out successfully');
};
