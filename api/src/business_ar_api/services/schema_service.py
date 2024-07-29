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
"""
This Module provides schema validation utilities.

This module offers the `SchemaService` class which provides functionality for loading,
validating and retrieving Json schemas from Json files. It provides methods to validate data against
a specified schema, load a schema from a Json file and return it, and get a schema with a given name.

Usage:
>>> from schema_service import SchemaService
>>> schema_service = SchemaService()
>>> valid, errors = schema_service.validate('schema_name', data)
>>> schema = schema_service.get_schema('schema_name')
"""

import json
import os

from business_ar_api.schemas.utils import validate


class SchemaService:
    """
    A class that provides utilities for working with schemas.

    Attributes:
        loaded_schemas (dict): A dictionary that contains the loaded schemas.

    Methods:
        scripts_directory(): Returns the directory path where the scripts are stored.
        validate(schema_name, data): Validates data against a specified schema.
        load_schema(schema_name): Load a schema from a JSON file and return it.
        get_schema(schema_name): Returns the schema with the given name.
    """

    loaded_schemas: dict = {}

    @staticmethod
    def scripts_directory():
        """
        This method is a static method that returns the directory path where the scripts are stored.

        Returns:
            str: A string representing the path of the scripts directory.
        """
        script_path = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(script_path, "..", "schemas")

    def validate(self, schema_name: str, data: dict) -> [bool, []]:
        """
        A method to validate data against a specified schema.

        Parameters:
            schema_name: A string representing the name of the schema to use for validation.
            data: A dictionary containing the data to be validated.

        Returns:
            A tuple consisting of a boolean value indicating whether the data is valid or not,
            and a list of validation errors if any.

        Raises:
            Exception: If the schema_name parameter is empty.
        """

        is_valid, validation_errors = validate(data, schema_name)
        if not is_valid:
            errors = []
            for error in validation_errors:
                # Serialize the error into a dictionary
                errors.append(
                    {
                        "message": error.message,
                        "json_path": error.json_path,
                        "relative_path": list(error.relative_path),
                        "context": [context.message for context in error.context],
                    }
                )
            return False, errors

        return True, []

    def load_schema(self, schema_name: str) -> dict | None:
        """
        Load a schema from a JSON file and return it.

        Parameters:
            schema_name (str): The name of the schema to load.

        Returns:
            dict | None: The loaded schema as a dictionary, or None if an error occurred.

        Raises:
            ValueError: If the schema file could not be found.
            ValueError: If there was an error decoding the JSON from the schema file.
            ValueError: If an unknown error occurred when loading the schema.
        """
        try:
            schema_file_name = f"{schema_name}.json"
            schema_file_path = os.path.join(
                SchemaService.scripts_directory(), "btr-bods", schema_file_name
            )
            if not os.path.exists(schema_file_path):
                raise ValueError(f"Schema file could not be found: {schema_file_name}")
            with open(schema_file_path, "r", encoding="UTF-8") as schema_file:
                schema = json.load(schema_file)
                self.loaded_schemas[schema_name] = schema
                return schema

        except json.JSONDecodeError:
            # raise ValueError(f'Error decoding JSON from schema file: {schema_file_name}')
            return None
        except Exception:
            # raise ValueError(f'Unexpected error occurred when loading schema: {str(e)}')
            return None

    def get_schema(self, schema_name: str) -> dict:
        """
        Returns the schema with the given name.

        Parameters:
            schema_name (str): The name of the schema to retrieve.

        Returns:
            dict: The schema with the given name.

        Raises:
            Exception: If the schema name is invalid.

        """
        if schema_name not in self.loaded_schemas:
            schema = self.load_schema(schema_name)
            if not schema:
                raise Exception(
                    f"invalid schema name: {schema_name}"
                )  # pylint: disable=broad-exception-raised
            self.loaded_schemas[schema_name] = schema

        return self.loaded_schemas[schema_name]
