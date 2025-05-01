import dotenv from 'dotenv';
import env from 'env-var';

dotenv.config();

const config = {
  port: env.get('PORT').default(3000).asPortNumber(),
  apiBaseUrl: env.get('API_BASE_URL').required().asString(),
  jwtSecretKey: env.get('JWT_SECRET_KEY').required().asString(),
  mailerService: env.get('MAILER_SERVICE').required().asString(),
  mailerEmail: env.get('MAILER_EMAIL').required().asString(),
  mailerKey: env.get('MAILER_KEY').required().asString(),
  nodeEnvironment: env.get('NODE_ENV').default('development').asString(),
};

export default config;
