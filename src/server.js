import express from "express";
import ViteExpress from "vite-express";

const app = express();

app.get("/env.js", (_, res) => {

    const env = {
        NODE_ENV: "production",
        VERSION: "99.0.0",
        MOCK: "off",

        OIDC_SERVER_URL: "http://localhost:8090/realms/trustify",
        OIDC_SERVER_IS_EMBEDDED: "false",
        OIDC_SERVER_EMBEDDED_PATH: "",
        AUTH_REQUIRED: "true",
        OIDC_CLIENT_ID: "frontend",
        OIDC_SCOPE: "openid",

        UI_INGRESS_PROXY_BODY_SIZE: "500m",

        ANALYTICS_ENABLED: "false",
        ANALYTICS_WRITE_KEY: "",
    };

    // Allow setting the app env via process.env
    for (const key in env) {
        if (process.env[key] !== undefined) {
            env[key] = process.env[key];
        }
    }

    res.send(`window._env = ${JSON.stringify(env)};`);
});

ViteExpress.listen(app, 3080, () => console.log("Server is listening on: http://localhost:3080"));
