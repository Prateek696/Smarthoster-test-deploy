import { getCompanyNameByPropertyId } from './services/property.service';

const testPropertyId = 392776; // use a valid listing/property ID here

async function test() {
  const name = await getCompanyNameByPropertyId(testPropertyId, 'name');
  console.log('Property name:', name);
}

test().catch(console.error);
