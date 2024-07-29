# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""All of the configuration for the service is captured here."""

import os
import sys

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

CONFIGURATION = {
    "development": "business_sync.config.DevConfig",
    "testing": "business_sync.config.TestConfig",
    "production": "business_sync.config.ProdConfig",
    "default": "business_sync.config.ProdConfig",
}


def get_named_config(config_name: str = "production"):
    """Return the configuration object based on the name."""
    if config_name in ["production", "staging", "default"]:
        config = ProdConfig()
    elif config_name == "testing":
        config = TestConfig()
    elif config_name == "development":
        config = DevConfig()
    else:
        raise KeyError(f"Unknown configuration '{config_name}'")
    return config


class _Config(object):  # pylint: disable=too-few-public-methods
    """Base class configuration."""

    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

    SENTRY_DSN = os.getenv("SENTRY_DSN", "")

    DEPLOYMENT_ENVIRONMENT = os.getenv("DEPLOYMENT_ENVIRONMENT", "development")

    DB_USER = os.getenv("DATABASE_USERNAME", "")
    DB_PASSWORD = os.getenv("DATABASE_PASSWORD", "")
    DB_NAME = os.getenv("DATABASE_NAME", "")
    DB_HOST = os.getenv("DATABASE_HOST", "")
    DB_PORT = int(os.getenv("DATABASE_PORT", "5432"))  # POSTGRESQL
    # POSTGRESQL
    if DB_UNIX_SOCKET := os.getenv("DATABASE_UNIX_SOCKET", None):
        SQLALCHEMY_DATABASE_URI = f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@/{DB_NAME}?unix_sock={DB_UNIX_SOCKET}/.s.PGSQL.5432"
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )

    WAREHOUSE_USER = os.getenv("WAREHOUSE_USER", "")
    WAREHOUSE_PASSWORD = os.getenv("WAREHOUSE_PASSWORD", "")
    WAREHOUSE_HOST = os.getenv("WAREHOUSE_HOST", "")
    WAREHOUSE_PORT = int(os.getenv("WAREHOUSE_PORT", "5432"))  # POSTGRESQL
    WAREHOUSE_DB_NAME = os.getenv("WAREHOUSE_DB_NAME", "")
    if WAREHOUSE_DB_UNIX_SOCKET := os.getenv("WAREHOUSE_DB_UNIX_SOCKET", None):
        WAREHOUSE_URI = f"postgresql+pg8000://{WAREHOUSE_USER}:{WAREHOUSE_PASSWORD}@/{WAREHOUSE_DB_NAME}?unix_sock={WAREHOUSE_DB_UNIX_SOCKET}/.s.PGSQL.5432"
    else:
        WAREHOUSE_URI = f"postgresql+pg8000://{WAREHOUSE_USER}:{WAREHOUSE_PASSWORD}@{WAREHOUSE_HOST}:{WAREHOUSE_PORT}/{WAREHOUSE_DB_NAME}"

    TESTING = False
    DEBUG = False


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True

    DATABASE_TEST_USERNAME = os.getenv("DATABASE_TEST_USERNAME", "")
    DATABASE_TEST_PASSWORD = os.getenv("DATABASE_TEST_PASSWORD", "")
    DATABASE_TEST_NAME = os.getenv("DATABASE_TEST_NAME", "")
    DATABASE_TEST_HOST = os.getenv("DATABASE_TEST_HOST", "")
    DATABASE_TEST_PORT = int(os.getenv("DATABASE_TEST_PORT", "5432"))  # POSTGRESQL

    SQLALCHEMY_DATABASE_URI = f"postgresql://{DATABASE_TEST_USERNAME}:{DATABASE_TEST_PASSWORD}@{DATABASE_TEST_HOST}:{DATABASE_TEST_PORT}/{DATABASE_TEST_NAME}"


class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", None)

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        print("WARNING: SECRET_KEY being set as a one-shot", file=sys.stderr)

    TESTING = False
    DEBUG = False
