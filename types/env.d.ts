declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      NEXT_PUBLIC_APP_URL: string
      DATABASE_URL: string
      DB_POOL_MIN: string
      DB_POOL_MAX: string
      JWT_SECRET: string
      JWT_EXPIRES_IN: string
      REFRESH_TOKEN_SECRET: string
      REFRESH_TOKEN_EXPIRES_IN: string
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      MAX_FILE_SIZE: string
      UPLOAD_DIR: string
      ALLOWED_FILE_TYPES: string
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USER?: string
      SMTP_PASSWORD?: string
      SMTP_FROM?: string
      AWS_ACCESS_KEY_ID?: string
      AWS_SECRET_ACCESS_KEY?: string
      AWS_REGION?: string
      AWS_S3_BUCKET?: string
      PAGINATION_LIMIT: string
      MAX_LOGIN_ATTEMPTS: string
      LOCKOUT_DURATION: string
      ENABLE_REGISTRATION: string
      ENABLE_EMAIL_VERIFICATION: string
      ENABLE_TWO_FACTOR_AUTH: string
    }
  }
}

export {}
