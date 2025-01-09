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

pub fn trustify_ui(ui: &UI) -> anyhow::Result<HashMap<&'static str, Resource>> {
    let mut resources = generate();

    let (env_js, modified) = ENV_JS.get_or_init(|| {
        let env = serde_json::to_string_pretty(ui)?;

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_millis();
        let now = now as u64;

        Ok((format!("window._env = {env}"), now))
    })?;

    // let (env_js, modified) = match result {
    //     Ok((index_html, modified)) => (index_html.as_bytes(), *modified),
    //     Err(err) => return Err(anyhow!(err)),
    // };

    resources.insert("env.js", new_resource(env_js, modified, "text/html"));
    Ok(resources)
}

static ENV_JS: OnceLock<anyhow::Result<(String, u64)>> = OnceLock::new();
