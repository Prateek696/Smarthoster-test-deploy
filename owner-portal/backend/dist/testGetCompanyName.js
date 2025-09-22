"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_service_1 = require("./services/property.service");
const testPropertyId = 392776; // use a valid listing/property ID here
async function test() {
    const name = await (0, property_service_1.getCompanyNameByPropertyId)(testPropertyId, 'name');
    console.log('Property name:', name);
}
test().catch(console.error);
