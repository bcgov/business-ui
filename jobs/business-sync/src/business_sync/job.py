# Copyright © 2024 Province of British Columbia
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
"""Job to sync business info from colin warehouse to business ar db.
"""
import os

import sqlalchemy
from business_ar_api.models import Business, db
from business_sync.config import CONFIGURATION
from business_sync.utils.logging import setup_logging
from flask import Flask
from sqlalchemy.sql.expression import text

setup_logging(os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf"))


def create_app(run_mode=os.getenv("FLASK_ENV", "production")):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(CONFIGURATION[run_mode])
    db.init_app(app)
    register_shellcontext(app)

    return app


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"app": app}

    app.shell_context_processor(shell_context)


def run():
    """Get the businesses from warehouse that has anniversary in next 2 days and sync the info
    with the Business AR db."""
    application = create_app()
    with application.app_context():
        try:
            warehouse_uri = application.config.get("WAREHOUSE_URI")
            env = application.config.get("DEPLOYMENT_ENVIRONMENT")
            engine = sqlalchemy.create_engine(warehouse_uri)
            with engine.connect() as connection:
                result_set = connection.execute(
                    text(
                        """
                        SELECT C.*,
                        S.STATE_TYP_CD AS CORP_STATE,
                        CN.CORP_NME AS CORP_NAME,
                        CT.CORP_CLASS AS CORP_CLASS
                        FROM 
                        COLIN.CORPORATION C,
                        COLIN.CORP_STATE S,
                        COLIN.CORP_NAME CN,
                        COLIN.CORP_TYPE CT
                        WHERE
                        C.CORP_NUM = S.CORP_NUM
                        AND S.END_EVENT_ID IS NULL
                        AND C.CORP_NUM = CN.CORP_NUM
                        AND CN.END_EVENT_ID IS NULL
                        AND C.CORP_TYP_CD = CT.CORP_TYP_CD
                        AND CT.CORP_CLASS IN ('BC', 'XPRO')
                        AND C.ADMIN_EMAIL IS NOT NULL
                        AND C.RECOGNITION_DTS IS NOT NULL
                        AND C.CORP_TYP_CD IN ('BC', 'C', 'ULC', 'CC', 'CCC')
                        AND (DATE_PART('doy',C.RECOGNITION_DTS) BETWEEN DATE_PART('doy',CURRENT_DATE) AND DATE_PART('doy',CURRENT_DATE + interval '14 days'))
                        ORDER BY C.RECOGNITION_DTS
                        LIMIT 5
                        """
                    )
                )
                results = result_set.all()
                application.logger.info(
                    "Number of businesses to update: {}".format(len(results))
                )
                for row in results:
                    try:
                        identifier = row.corp_num
                        if row.corp_typ_cd == "BC" and not row.corp_num.startswith(
                            "BC"
                        ):
                            identifier = f"BC{row.corp_num}"
                        business = Business.find_by_identifier(identifier)
                        if not business:
                            business = Business(
                                identifier=identifier,
                                legal_type=row.corp_typ_cd,
                                founding_date=row.recognition_dts,
                            )
                        business.legal_name = row.corp_name
                        business.email = (
                            row.admin_email if env == "production" else "test@email.com"
                        )
                        business.ar_reminder_flag = (
                            False if row.send_ar_ind == "N" else True
                        )
                        business.state = row.corp_state
                        # business.op_state = row.op_state
                        business.tax_id = row.bn_15
                        business.corp_class = row.corp_class
                        business.save()
                    except Exception as exc:
                        application.logger.error(exc)
        except Exception as err:
            application.logger.error(err)
