"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOwnerStatements = void 0;
const hostkit_api_1 = require("../integrations/hostkit.api");
const invoice_service_1 = require("./invoice.service");
const propertyApiKey_1 = require("../utils/propertyApiKey");
const property_model_1 = __importDefault(require("../models/property.model"));
const calculateOwnerStatements = async (propertyId, startDate, endDate, commissionPercentage) => {
    try {
        // Get API key for the property
        const apiKey = await (0, propertyApiKey_1.getHostkitApiKey)(propertyId);
        if (!apiKey) {
            throw new Error(`No API key found for property ${propertyId}`);
        }
        // Check if property requires commission
        let property;
        let requiresCommission = true; // Default to true if property not found
        try {
            console.log(`🔍 Looking up property ${propertyId} in database...`);
            property = await property_model_1.default.findOne({ id: propertyId });
            console.log(`🔍 Property lookup result:`, property ? `Found: ${property.name}` : 'Not found');
            if (property) {
                // Admin-owned properties don't require commission, owner properties do
                requiresCommission = !property.isAdminOwned;
                console.log(`🏠 Property ${propertyId} found: ${property.name}, isAdminOwned: ${property.isAdminOwned}, commission required: ${requiresCommission}`);
                console.log(`🏠 Property details:`, {
                    id: property.id,
                    name: property.name,
                    isAdminOwned: property.isAdminOwned,
                    requiresCommission: requiresCommission,
                    createdAt: property.createdAt,
                    updatedAt: property.updatedAt
                });
            }
            else {
                console.log(`⚠️ Property ${propertyId} not found in database, defaulting to commission required: ${requiresCommission}`);
            }
        }
        catch (error) {
            console.error(`❌ Error looking up property ${propertyId}:`, error);
            console.log(`⚠️ Using default commission required: ${requiresCommission}`);
        }
        // Get hostkit ID for the property dynamically
        const hostkitId = await (0, propertyApiKey_1.getHostkitId)(propertyId);
        if (!hostkitId) {
            throw new Error(`Property ${propertyId} not found in Hostkit mapping`);
        }
        // Fetch both invoices and reservations from Hostkit
        const [invoicesData, reservationsData] = await Promise.all([
            (0, invoice_service_1.getInvoicesService)(propertyId, startDate, endDate),
            (0, hostkit_api_1.getHostkitReservations)(propertyId, startDate, endDate)
        ]);
        if (!reservationsData || !Array.isArray(reservationsData)) {
            throw new Error('No reservation data received from Hostkit');
        }
        if (!invoicesData || !Array.isArray(invoicesData)) {
            throw new Error('No invoice data received from Hostkit');
        }
        // Debug: Show ALL invoices with their data
        console.log('📄 ALL INVOICES:');
        invoicesData.forEach((inv, index) => {
            console.log(`Invoice ${index + 1}:`, {
                refid: inv.refid,
                refseries: inv.refseries,
                amount: inv.amount,
                date: inv.date,
                status: inv.status,
                type: inv.type
            });
        });
        // Filter reservations by date range (client-side filtering)
        const filteredReservations = reservationsData.filter((res) => {
            const inDate = new Date(parseInt(res.in_date) * 1000);
            const outDate = new Date(parseInt(res.out_date) * 1000);
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);
            // Check if reservation check-in date is within the requested date range
            return inDate >= startDateObj && inDate <= endDateObj;
        });
        console.log(`📅 Date filtering: ${reservationsData.length} total reservations, ${filteredReservations.length} in date range ${startDate} to ${endDate}`);
        // Debug: Show ALL filtered reservations with their data
        console.log('🔍 ALL FILTERED RESERVATIONS:');
        filteredReservations.forEach((res, index) => {
            const inDate = new Date(parseInt(res.in_date) * 1000);
            const outDate = new Date(parseInt(res.out_date) * 1000);
            console.log(`Reservation ${index + 1}:`, {
                rcode: res.rcode,
                in_date: res.in_date,
                out_date: res.out_date,
                in_date_formatted: inDate.toISOString().split('T')[0],
                out_date_formatted: outDate.toISOString().split('T')[0],
                received_amount: res.received_amount,
                host_commission: res.host_commission,
                cleaning_fee: res.cleaning_fee,
                extra_fees: res.extra_fees,
                city_tax: res.city_tax,
                provider: res.provider
            });
        });
        const reservations = filteredReservations.map((res) => ({
            rcode: res.rcode,
            received_amount: parseFloat(res.received_amount) || 0,
            host_commission: parseFloat(res.host_commission) || 0,
            cleaning_fee: parseFloat(res.cleaning_fee) || 0,
            extra_fees: parseFloat(res.extra_fees) || 0,
            city_tax: parseFloat(res.city_tax) || 0,
            invoiced_value: parseFloat(res.invoiced_value) || 0,
            arrival: res.arrival,
            departure: res.departure,
            pax: parseInt(res.pax) || 0,
            firstname: res.firstname,
            lastname: res.lastname,
            provider: res.provider,
            invoiced: res.invoiced
        }));
        // Calculate totals from reservations (for breakdown)
        const total_host_commission = reservations.reduce((sum, res) => sum + res.host_commission, 0);
        // Cleaning fee comes from reservation data (varies by property)
        const total_cleaning_fees = reservations.reduce((sum, res) => sum + res.cleaning_fee, 0);
        const total_extra_fees = reservations.reduce((sum, res) => sum + res.extra_fees, 0);
        const total_city_tax = reservations.reduce((sum, res) => sum + res.city_tax, 0);
        console.log(`[DEBUG] Reservation totals:`, {
            reservationCount: reservations.length,
            totalHostCommission: total_host_commission,
            totalCleaningFees: total_cleaning_fees,
            totalExtraFees: total_extra_fees,
            totalCityTax: total_city_tax
        });
        // Filter invoices by date range (client-side filtering)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const filteredInvoices = invoicesData.filter((invoice) => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= startDateObj && invoiceDate <= endDateObj;
        });
        console.log(`[DEBUG] Invoices filtering for property ${propertyId}:`, {
            totalInvoices: invoicesData.length,
            filteredInvoices: filteredInvoices.length,
            dateRange: `${startDate} to ${endDate}`,
            sampleInvoice: filteredInvoices[0]
        });
        const total_invoiced_value = filteredInvoices.reduce((sum, invoice) => {
            const value = parseFloat(invoice.value) || 0;
            console.log(`[DEBUG] Filtered Invoice ${invoice.id}: value=${value}, date=${invoice.date}`);
            return sum + value;
        }, 0);
        console.log(`[DEBUG] Total filtered invoice value: ${total_invoiced_value}`);
        // Use invoice amount as the base revenue (what actually gets billed)
        // If no invoices found, fallback to reservation amounts
        const total_revenue = total_invoiced_value > 0 ? total_invoiced_value : reservations.reduce((sum, res) => sum + res.received_amount, 0);
        console.log(`[DEBUG] Revenue source: ${total_invoiced_value > 0 ? 'INVOICES' : 'RESERVATIONS (fallback)'}`);
        console.log(`[DEBUG] Final total revenue: ${total_revenue}`);
        // Calculate management commission: 25% of (Gross - Cleaning Fee) (only if property requires commission)
        const management_commission = requiresCommission
            ? (total_revenue - total_cleaning_fees) * (commissionPercentage / 100)
            : 0;
        // Calculate net amount owner receives
        const net_amount_owner = total_revenue - management_commission;
        console.log(`💰 Commission calculation: ${requiresCommission ? 'ENABLED' : 'DISABLED'}`);
        console.log(`💰 Management commission: €${management_commission.toFixed(2)}`);
        console.log(`💰 Net payout: €${net_amount_owner.toFixed(2)}`);
        const summary = {
            total_revenue,
            total_host_commission,
            total_cleaning_fees,
            total_extra_fees,
            total_city_tax,
            total_invoiced_value,
            management_commission: Math.round(management_commission * 100) / 100, // Round to 2 decimal places
            net_amount_owner: Math.round(net_amount_owner * 100) / 100,
            commission_percentage: commissionPercentage,
            reservation_count: reservations.length
        };
        return {
            summary,
            reservations,
            property_id: propertyId,
            start_date: startDate,
            end_date: endDate,
            generated_at: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Error calculating owner statements:', error);
        throw error;
    }
};
exports.calculateOwnerStatements = calculateOwnerStatements;
