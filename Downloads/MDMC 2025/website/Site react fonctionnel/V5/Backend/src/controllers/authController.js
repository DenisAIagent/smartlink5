const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.mdmcmusicads.com' : undefined
  };

  const refreshOptions = {
    ...options,
    path: '/api/v1/auth/refresh-token'
  };

  res.status(statusCode).cookie('access_token', accessToken, options).cookie('refresh_token', refreshToken, refreshOptions).json({
    success: true,
    access_token: accessToken,
    refresh_token: refreshToken
  });
}; 