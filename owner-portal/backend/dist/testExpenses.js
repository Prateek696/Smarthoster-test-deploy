"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const expense_service_1 = require("./services/expense.service");
async function testFetchExpenses() {
    const propertyId = 392776; // Replace with a valid property ID for your Hostkit account
    const year = 2025;
    const month = 7;
    const expenses = await (0, expense_service_1.fetchExpenses)(propertyId, year, month);
    console.log('Fetched Expenses:', expenses);
}
testFetchExpenses().catch(console.error);
