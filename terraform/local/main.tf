resource "kubernetes_namespace" "potato" {
  metadata {
    name = var.namespace
  }
}

resource "kubernetes_config_map_v1" "app_config" {
  metadata {
    name      = "potato-config"
    namespace = kubernetes_namespace.potato.metadata[0].name
  }

  data = {
    NODE_ENV        = "production"
    NEXT_PUBLIC_URL = var.next_public_url
    SITE_URL        = var.site_url
    REDIS_URL       = "redis://redis:6379"
  }
}

resource "kubernetes_secret_v1" "app_secrets" {
  metadata {
    name      = "potato-secrets"
    namespace = kubernetes_namespace.potato.metadata[0].name
  }

  type = "Opaque"

  data = {
    NEXT_PUBLIC_SUPABASE_URL      = base64encode(var.supabase_url)
    NEXT_PUBLIC_SUPABASE_ANON_KEY = base64encode(var.supabase_anon_key)
    SUPABASE_SERVICE_ROLE_KEY     = base64encode(var.supabase_service_role_key)
    GEMINI_API_KEY                = base64encode(var.gemini_api_key)
  }
}

resource "kubernetes_deployment_v1" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.potato.metadata[0].name
    labels = {
      app = "redis"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "redis"
      }
    }

    template {
      metadata {
        labels = {
          app = "redis"
        }
      }

      spec {
        container {
          name  = "redis"
          image = "redis:7-alpine"

          port {
            container_port = 6379
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.potato.metadata[0].name
  }

  spec {
    selector = {
      app = "redis"
    }

    port {
      port        = 6379
      target_port = 6379
    }
  }
}

resource "kubernetes_deployment_v1" "app" {
  metadata {
    name      = "potato-app"
    namespace = kubernetes_namespace.potato.metadata[0].name
    labels = {
      app = "potato-app"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "potato-app"
      }
    }

    template {
      metadata {
        labels = {
          app = "potato-app"
        }
      }

      spec {
        container {
          name              = "potato-app"
          image             = var.app_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 3000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.app_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret_v1.app_secrets.metadata[0].name
            }
          }

          readiness_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            initial_delay_seconds = 10
            period_seconds        = 10
          }

          liveness_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            initial_delay_seconds = 20
            period_seconds        = 20
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service_v1.redis]
}

resource "kubernetes_service_v1" "app" {
  metadata {
    name      = "potato-app"
    namespace = kubernetes_namespace.potato.metadata[0].name
  }

  spec {
    type = "NodePort"

    selector = {
      app = "potato-app"
    }

    port {
      port        = 3000
      target_port = 3000
      node_port   = 30080
    }
  }
}
