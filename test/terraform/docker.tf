terraform {
  required_providers {
    docker = {
      source = "kreuzwerker/docker"
    }
  }
  required_version = ">= 1.7.5"
}

provider docker {
}

resource "random_string" "app_secret" {
  length           = 16
  special          = false
  override_special = "/@\" "
}

resource docker_image "regapi_image" {
  name = "regapi"
}

locals {
  apiEnv = [ 
    "FLASK_ENV=development",
    "FLASK_APP=wsgi.py",
    "SECRET_KEY=${md5(random_string.app_secret.result)}",
    "APP_SETTINGS=dev",

    "DATABASE_USERNAME=padmin",
    "DATABASE_PASSWORD=${random_string.postgresSuperPassword.result}",
    "DATABASE_NAME=business-ar",
    "DATABASE_HOST=reg_postgres",
    "DATABASE_PORT=5432",

    "DATABASE_TEST_USERNAME=padmin",
    "DATABASE_TEST_PASSWORD=${random_string.postgresSuperPassword.result}",
    "DATABASE_TEST_NAME=business-ar-test",
    "DATABASE_TEST_HOST=reg_postgres",
    "DATABASE_TEST_PORT=5432",

    "AUTH_API_URL=${var.auth_api_url}",
    "PAY_API_URL=${var.pay_api_url}",

    "JWT_OIDC_ALGORITHMS=RS256",
    "JWT_OIDC_AUDIENCE=account-services",
    "JWT_OIDC_CACHING_ENABLED=True",
    "JWT_OIDC_CLIENT_SECRET=${random_string.app_secret.result}",
    "JWT_OIDC_ISSUER=${var.oidc_issuer}",
    "JWT_OIDC_JWKS_CACHE_TIMEOUT=6000",
    "JWT_OIDC_WELL_KNOWN_CONFIG=${var.oidc_well_known_config}",

    "AUTH_SVC_URL=${var.auth_svc_url}",
    "AUTH_SVC_CLIENT_ID=${var.auth_client_id}",
    "AUTH_SVC_CLIENT_SECRET=${var.auth_client_secret}",


    "COLIN_API_URL=${var.colin_api_url}",
    "COLIN_API_SVC_CLIENT_ID=${var.colin_client_id}",
    "COLIN_API_SVC_CLIENT_SECRET=${var.colin_client_secret}",

    "DASHBOARD_URL=${var.dashboard_url}",
    "EMAIL_TEMPLATE_PATH=src/business_ar_api/email_templates",
    "NOTIFY_API_URL=${var.notify_api_url}",
    "NOTIFY_API_VERSION=${var.notify_api_version}",
    "REPORT_API_URL=${var.report_api_url}",
    "REPORT_API_VERSION=${var.report_api_version}",
  ]
}

resource docker_container "regapi_container" {
  name = "regapi"
  image = docker_image.regapi_image.image_id
  ports {
    internal = 8080
    external = 8080
  }
  restart = "on-failure"

  depends_on = [ docker_container.postgres_container ]
  networks_advanced {
    name = docker_network.private_network.name
  }
  env = local.apiEnv
}
resource docker_container "regapi_container_exec" {
  name = "regapi_exec"
  count = var.init ? 1 : 0
  image = docker_image.regapi_image.image_id

  depends_on = [ docker_container.regapi_container, docker_container.postgres_container ]
  networks_advanced {
    name = docker_network.private_network.name
  }
  env = local.apiEnv

  command = ["sh", "-c", "sleep 20 && flask db upgrade && flask db migrate"]
}

# data "template_file" "firebase_adminsdk_json" {
#   template = file("${path.module}/project-firebase-adminsdk.json")
#   vars = {
#   }
# }

# resource "local_file" "firebase_adminsdk_json_file" {
#   content  = data.template_file.firebase_adminsdk_json.rendered
#   filename = "${var.hostRootPath}/data/web/project-firebase-adminsdk.json"
# }

resource docker_image "regweb_image" {
  name = "regweb"
}

resource docker_container "regweb_container" {
  name = "regweb"
  image = docker_image.regweb_image.image_id
  restart = "on-failure"
  ports {
    internal = 3000
    external = 3000
  }
  ports {
    internal = 4000
    external = 4000
  }

  volumes {
    host_path      = "${var.hostRootPath}/data/web"
    container_path = "/app/config"
  }

  networks_advanced {
    name = docker_network.private_network.name
  }
  env = [ 
    "VUE_APP_ADDRESS_COMPLETE_KEY=${var.canada_post_api_key}",
    "VUE_APP_PAY_API_URL=${var.pay_api_url}",
    "VUE_APP_PAY_API_VERSION=${var.pay_api_version}",
    "NUXT_KEYCLOAK_AUTH_URL=${var.auth_url}",
    "NUXT_KEYCLOAK_REALM=${var.auth_realm}",
    "NUXT_KEYCLOAK_CLIENTID=${var.nuxt_client_id}",
    "NUXT_BAR_API_URL=${var.hostname}:${var.apiHostPort}",
    "NUXT_BAR_API_VERSION=/v1",
    "NUXT_BASE_URL=${var.hostname}:${var.uiHostPort}/",
    "NUXT_PAYMENT_PORTAL_URL=${var.paymentPortalUrl}",
    "NUXT_REGISTRY_HOME_URL=${var.registry_home_url}",
  ]
}


