export const isEnvironment = (env: "development" | "production") => {
  return process.env.NODE_ENV === env;
};

export const isDevelopment = isEnvironment("development");
export const isProduction = isEnvironment("production");
