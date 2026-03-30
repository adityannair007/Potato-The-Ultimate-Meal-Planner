variable "kubeconfig_path" {
  description = "Path to kubeconfig for the local cluster"
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  description = "Namespace for local deployment"
  type        = string
  default     = "potato-local"
}

variable "app_image" {
  description = "Container image for the app"
  type        = string
  default     = "potato-app:local"
}

variable "next_public_url" {
  description = "Public app URL used by the frontend"
  type        = string
  default     = "http://localhost:3000"
}

variable "site_url" {
  description = "Site URL used by auth redirects"
  type        = string
  default     = "http://localhost:3000"
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anon key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini API key"
  type        = string
  default     = ""
  sensitive   = true
}
