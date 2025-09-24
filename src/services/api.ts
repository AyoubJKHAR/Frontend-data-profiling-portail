const API_BASE = import.meta.env.VITE_API_BASE; // défini dans .env

export const BACKEND_URL    = `${API_BASE}/lakehouses-with-tables`;
export const CONFIG_URL     = `${API_BASE}/add_selected_lakehouses_tables_to_config`;
export const RUN_PIPELINE_URL = `${API_BASE}/run-pipeline`;
