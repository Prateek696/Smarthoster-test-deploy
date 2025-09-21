"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const hostkit_api_1 = require("../integrations/hostkit.api");
const BASE_URL = 'http://localhost:5000';
const TEST_PROPERTY_ID = 392776; // Use one of your seeded properties
// Test authentication token (you'll need to replace this with a real token)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjFkY2U1M2ZmYjgwYTFmOWNmNDFjNCIsInJvbGUiOiJvd25lciIsImlhdCI6MTc1NzQwMjIyNywiZXhwIjoxNzU3NDIwMjI3fQ';
async function testReservationAPI() {
    console.log('🧪 Testing Hostkit Reservation API');
    console.log('===================================');
    try {
        // Test 1: Direct Hostkit API call
        console.log('\n1️⃣ Testing direct Hostkit API call...');
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        console.log(`📅 Date range: ${startDate} to ${endDate}`);
        const directResult = await (0, hostkit_api_1.getHostkitReservations)(TEST_PROPERTY_ID, startDate, endDate);
        console.log('✅ Direct API call successful');
        console.log(`📊 Found ${Array.isArray(directResult) ? directResult.length : 'unknown'} reservations`);
        if (Array.isArray(directResult) && directResult.length > 0) {
            console.log('📋 Sample reservation data:');
            console.log(JSON.stringify(directResult[0], null, 2));
        }
        // Test 2: Backend API endpoint
        console.log('\n2️⃣ Testing backend API endpoint...');
        const apiResponse = await axios_1.default.get(`${BASE_URL}/reservations/${TEST_PROPERTY_ID}`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                startDate,
                endDate
            }
        });
        console.log('✅ Backend API call successful');
        console.log(`📊 Status: ${apiResponse.status}`);
        console.log(`📋 Response data:`, JSON.stringify(apiResponse.data, null, 2));
        // Test 3: Backend API with filters
        console.log('\n3️⃣ Testing backend API with filters...');
        const filteredResponse = await axios_1.default.get(`${BASE_URL}/reservations/${TEST_PROPERTY_ID}`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                startDate,
                endDate,
                get_archived: 'false',
                from_date: startDate
            }
        });
        console.log('✅ Filtered API call successful');
        console.log(`📊 Status: ${filteredResponse.status}`);
        console.log(`📋 Filtered response:`, JSON.stringify(filteredResponse.data, null, 2));
        // Test 4: Summary endpoint
        console.log('\n4️⃣ Testing summary endpoint...');
        const summaryResponse = await axios_1.default.get(`${BASE_URL}/reservations/${TEST_PROPERTY_ID}/summary`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                startDate,
                endDate
            }
        });
        console.log('✅ Summary API call successful');
        console.log(`📊 Status: ${summaryResponse.status}`);
        console.log(`📋 Summary data:`, JSON.stringify(summaryResponse.data, null, 2));
        console.log('\n🎉 All tests completed successfully!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('📊 Response status:', error.response.status);
            console.error('📋 Response data:', error.response.data);
        }
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Connection refused - make sure the backend server is running on port 5000');
        }
    }
}
// Test individual reservation endpoint if we have a reservation code
async function testSingleReservation() {
    console.log('\n🔍 Testing single reservation endpoint...');
    try {
        // First get reservations to find a reservation code
        const reservationsResponse = await axios_1.default.get(`${BASE_URL}/reservations/${TEST_PROPERTY_ID}`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        const reservations = reservationsResponse.data.data;
        if (Array.isArray(reservations) && reservations.length > 0) {
            const firstReservation = reservations[0];
            const reservationCode = firstReservation.rcode || firstReservation.reservationCode || firstReservation.id;
            if (reservationCode) {
                console.log(`🔍 Testing with reservation code: ${reservationCode}`);
                const singleReservationResponse = await axios_1.default.get(`${BASE_URL}/reservations/${TEST_PROPERTY_ID}/${reservationCode}`, {
                    headers: {
                        'Authorization': `Bearer ${AUTH_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Single reservation API call successful');
                console.log(`📋 Single reservation data:`, JSON.stringify(singleReservationResponse.data, null, 2));
            }
            else {
                console.log('⚠️ No reservation code found in reservation data');
            }
        }
        else {
            console.log('⚠️ No reservations found to test single reservation endpoint');
        }
    }
    catch (error) {
        console.error('❌ Single reservation test failed:', error.message);
    }
}
// Run the tests
async function runTests() {
    await testReservationAPI();
    await testSingleReservation();
}
runTests().catch(console.error);
