type Envs = 'dev' | 'qa' | 'local' | 'production';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: Envs;
      PORT: string;
      TOKEN_SECRET: string;

      DATABASE_URL: string;

      POSTGRES_DB_HOST: string;
      POSTGRES_DB_USER: string;
      POSTGRES_DB_PASS: string;
      POSTGRES_DB_BASE: string;
      POSTGRES_DB_PORT: string;

      REDIS_HOST: string;
      REDIS_PASS: string;
      REDIS_PORT: string;
    }
  }
}

export {};
