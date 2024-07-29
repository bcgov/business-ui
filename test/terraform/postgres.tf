resource "random_string" "postgresSuperPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
}


data docker_registry_image "postgres" {
  name = "postgres:16.2-alpine3.19"
}

resource "docker_image" "postgres" {
  name          = data.docker_registry_image.postgres.name
  pull_triggers = [data.docker_registry_image.postgres.sha256_digest]
  keep_locally  = true
}

resource docker_container "postgres_container" {
  name = "reg_postgres"
  image = docker_image.postgres.image_id
  restart = "on-failure"
  volumes {
    host_path      = "${var.hostRootPath}/data/postgres"
    container_path = "/var/lib/postgresql/data"
  }

  volumes {
    host_path      = "${var.hostRootPath}/initdb"
    container_path = "/docker-entrypoint-initdb.d"
  }
  
  ports{
    internal = 5432
    external = 5432
  }

  env = [
    "POSTGRES_USER=padmin",
    "POSTGRES_PASSWORD=${random_string.postgresSuperPassword.result}",
  ]
  networks_advanced {
    name = docker_network.private_network.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U padmin"]
    interval     = "5s"
    timeout      = "5s"
    start_period = "5s"
    retries      = 20
  }
}

data "template_file" "postgres_script" {
  template = file("${path.module}/sql/initDBs.tpl")
  vars = {
    POSTGRES_APP_USERNAME = "padmin"
    POSTGRES_APP_PASSWORD = random_string.postgresSuperPassword.result
  }
}

resource "local_file" "postgres_script" {
  content  = data.template_file.postgres_script.rendered
  filename = "${var.hostRootPath}/initdb/postgres_script.sql"
}

data "template_file" "postgres_preload_script" {
  template = file("${path.module}/sql/initTables.sql")
  vars = { 
  }
}

resource "local_file" "postgres_preload_script" {
  content  = data.template_file.postgres_preload_script.rendered
  filename = "${var.hostRootPath}/preload/preload_script.sql"
}


resource docker_container "postgres_container_exec" {
  name = "reg_postgres_exec"
  count = var.init ? 1 : 0
  image = docker_image.postgres.image_id
  restart = "on-failure"
  volumes {
    host_path      = "${var.hostRootPath}/data/postgres"
    container_path = "/var/lib/postgresql/data"
  }

    volumes {
    host_path      = "${var.hostRootPath}/preload"
    container_path = "/preload"
  }

  env = [
    "POSTGRES_USER=padmin",
    "POSTGRES_PASSWORD=${random_string.postgresSuperPassword.result}",
    "PGPASSWORD=${random_string.postgresSuperPassword.result}",
  ]
  networks_advanced {
    name = docker_network.private_network.name
  }

  command = ["sh", "-c", "sleep 35 && psql -h reg_postgres -U padmin -d business-ar -f /preload/preload_script.sql"]
}