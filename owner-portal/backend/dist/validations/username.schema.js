"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showUsernameSchema = void 0;
const zod_1 = require("zod");
exports.showUsernameSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6)
});
