include!(concat!(env!("OUT_DIR"), "/generated.rs"));

use serde::Serialize;
use static_files::resource::new_resource;
use static_files::Resource;
use std::collections::HashMap;
use std::sync::OnceLock;

#[derive(Serialize, Clone, Default)]
pub struct UI {
    #[serde(rename(serialize = "VERSION"))]
    pub version: String,

    #[serde(rename(serialize = "AUTH_REQUIRED"))]
    pub auth_required: String,

    #[serde(rename(serialize = "OIDC_SERVER_URL"))]
    pub oidc_server_url: String,

    #[serde(rename(serialize = "OIDC_CLIENT_ID"))]
    pub oidc_client_id: String,

    #[serde(rename(serialize = "OIDC_SCOPE"))]
    pub oidc_scope: String,

    #[serde(rename(serialize = "ANALYTICS_ENABLED"))]
    pub analytics_enabled: String,

    #[serde(rename(serialize = "ANALYTICS_WRITE_KEY"))]
    pub analytics_write_key: String,
}

pub fn generate_env_js(ui: &UI) -> anyhow::Result<(String, u64)> {
    let env = serde_json::to_string_pretty(ui)?;
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)?
        .as_millis();
    let now = now as u64;

    Ok((format!("window._env = {env}"), now))
}

pub fn trustify_ui(ui: &UI) -> anyhow::Result<HashMap<&'static str, Resource>> {
    let mut resources = generate();

    let (env_js, modified) = ENV_JS.get_or_init(|| {
        generate_env_js(ui).unwrap_or_else(|err| {
            eprintln!("Failed to generate env.js: {}", err);
            ("{}".to_string(), 0)
        })
    });

    resources.insert(
        "env.js",
        new_resource(env_js.as_bytes(), *modified, "text/javascript"),
    );
    Ok(resources)
}

static ENV_JS: OnceLock<(String, u64)> = OnceLock::new();
