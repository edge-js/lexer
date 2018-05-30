"use strict";
/**
 * @module Lexer
 */
Object.defineProperty(exports, "__esModule", { value: true });
var NodeType;
(function (NodeType) {
    NodeType["BLOCK"] = "block";
    NodeType["RAW"] = "raw";
    NodeType["NEWLINE"] = "newline";
    NodeType["MUSTACHE"] = "mustache";
})(NodeType || (NodeType = {}));
exports.NodeType = NodeType;
var MustacheType;
(function (MustacheType) {
    MustacheType["SMUSTACHE"] = "s__mustache";
    MustacheType["ESMUSTACHE"] = "es__mustache";
    MustacheType["MUSTACHE"] = "mustache";
    MustacheType["EMUSTACHE"] = "e__mustache";
})(MustacheType || (MustacheType = {}));
exports.MustacheType = MustacheType;
var WhiteSpaceModes;
(function (WhiteSpaceModes) {
    WhiteSpaceModes[WhiteSpaceModes["NONE"] = 0] = "NONE";
    WhiteSpaceModes[WhiteSpaceModes["ALL"] = 1] = "ALL";
})(WhiteSpaceModes || (WhiteSpaceModes = {}));
exports.WhiteSpaceModes = WhiteSpaceModes;
