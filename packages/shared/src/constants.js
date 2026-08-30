"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LISTING_CONDITIONS = exports.SCHEMA_STATUS = exports.CATEGORY_STATUS = exports.CONDITION_OPERATORS = exports.FIELD_TYPES = void 0;
exports.FIELD_TYPES = {
    TEXT: "TEXT",
    TEXTAREA: "TEXTAREA",
    NUMBER: "NUMBER",
    SELECT: "SELECT",
    RADIO: "RADIO",
    CHECKBOX: "CHECKBOX",
    MULTI_SELECT: "MULTI_SELECT",
    DATE: "DATE",
};
exports.CONDITION_OPERATORS = ["equals", "not_equals", "in", "not_in"];
exports.CATEGORY_STATUS = {
    ACTIVE: "ACTIVE",
    ARCHIVED: "ARCHIVED",
};
exports.SCHEMA_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
};
exports.LISTING_CONDITIONS = ["NEW", "LIKE_NEW", "USED", "REFURBISHED"];
