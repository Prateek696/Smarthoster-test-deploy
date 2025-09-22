import dotenv from 'dotenv';
dotenv.config();

import { fetchExpenses } from './services/expense.service';

async function testFetchExpenses() {
  const propertyId = 392776;  // Replace with a valid property ID for your Hostkit account
  const year = 2025;
  const month = 7;

  const expenses = await fetchExpenses(propertyId, year, month);
  console.log('Fetched Expenses:', expenses);
}

testFetchExpenses().catch(console.error);
