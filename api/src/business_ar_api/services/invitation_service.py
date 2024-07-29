# Copyright © 2024 Province of British Columbia
#
# Licensed under the BSD 3 Clause License, (the "License");
# you may not use this file except in compliance with the License.
# The template for the license can be found here
#    https://opensource.org/license/bsd-3-clause/
#
# Redistribution and use in source and binary forms,
# with or without modification, are permitted provided that the
# following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
#
# 3. Neither the name of the copyright holder nor the names of its contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS”
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
# THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
"""Invitation Service."""
from datetime import datetime
from flask import current_app
from sqlalchemy import String, and_, desc, func, or_
from typing import Dict

from business_ar_api.models import db
from business_ar_api.models import Business as BusinessModel
from business_ar_api.models import Invitations as InvitationsModel
from business_ar_api.models.dataclass import InvitationSearch


class InvitationService:

    def __init__(self):
        pass

    @classmethod
    def find_invitation_by_token(cls, token: str) -> InvitationsModel:
        """Finds an invitation by its token"""
        return InvitationsModel.find_invitation_by_token(token)

    @classmethod
    def find_active_invitation_by_business(cls, business_id: int) -> InvitationsModel:
        """Finds active invitations for a business."""
        return InvitationsModel.find_invitations_by_business_id(
            business_id, InvitationsModel.Status.SENT
        )

    @classmethod
    def search_invitations(cls, search_criteria: InvitationSearch) -> InvitationsModel:
        """Finds invitations matching search text."""
        current_app.logger.info(
            f"Search Invitations: {search_criteria.search_text}, {search_criteria.status}"
        )

        query = (
            db.session.query(InvitationsModel, BusinessModel)
            .join(BusinessModel)
            .filter(BusinessModel.id == InvitationsModel.business_id)
            .order_by(InvitationsModel.id.desc())
        )

        if search_criteria.search_text:
            business_query = db.session.query(BusinessModel)
            business_query = business_query.filter(
                or_(
                    BusinessModel.identifier.ilike(f"%{search_criteria.search_text}%"),
                    BusinessModel.legal_name.ilike(f"%{search_criteria.search_text}%"),
                )
            )
            business_ids = [business.id for business in business_query.all()]

            query = query.filter(
                or_(
                    InvitationsModel.recipients.ilike(search_criteria.search_text),
                    InvitationsModel.business_id.in_(business_ids),
                )
            )

        if search_criteria.status:
            query = query.filter(
                InvitationsModel.status == search_criteria.status.upper()
            )

        pagination = query.paginate(
            per_page=search_criteria.limit, page=search_criteria.page
        )

        search_results = []
        for item in pagination.items:
            search_results.append(InvitationService._construct_search_result_item(item))

        return {
            "page": search_criteria.page,
            "limit": search_criteria.limit,
            "items": search_results,
            "total": pagination.total,
        }

    @classmethod
    def _construct_search_result_item(cls, item) -> Dict:
        invitation: InvitationsModel = item[0]
        business: BusinessModel = item[1]
        result = {**business.json(), **invitation.json()}
        return result

    @classmethod
    def expire_invitation(cls, invitation_id: int) -> InvitationsModel:
        """Expires an invitation."""
        invitation = InvitationsModel.find_invitation_by_id(invitation_id=invitation_id)
        if invitation.status == InvitationsModel.Status.EXPIRED:
            return
        invitation.status = InvitationsModel.Status.EXPIRED
        invitation.expiration_date = datetime.utcnow()
        invitation.save()
