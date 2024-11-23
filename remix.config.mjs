/** @type {import('@remix-run/dev').AppConfig} */
export const ignoredRouteFiles = ["**/.*"];
export const server =
  process.env.NODE_ENV === "development" ? undefined : "./server.js";
export const serverBuildPath = "api/index.js";
export const tailwind = {
  config: "./tailwind.config.js",
};
