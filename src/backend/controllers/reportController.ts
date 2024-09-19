import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { InventoryItem } from '../models/InventoryItem';
import { ReportType } from '../types/ReportType';
import { DateRange } from '../types/DateRange';

// Generate a report based on the specified type and date range
export const generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract report type and date range from request query parameters
        const reportType = req.query.type as ReportType;
        const dateRange: DateRange = {
            startDate: new Date(req.query.startDate as string),
            endDate: new Date(req.query.endDate as string)
        };

        // Validate report type and date range
        if (!reportType || !dateRange.startDate || !dateRange.endDate) {
            res.status(400).json({ error: 'Invalid report type or date range' });
            return;
        }

        // Call appropriate report generation function based on report type
        let reportData;
        switch (reportType) {
            case ReportType.SALES:
                reportData = await generateSalesReport(dateRange);
                break;
            case ReportType.INVENTORY:
                reportData = await generateInventoryReport();
                break;
            case ReportType.FULFILLMENT:
                reportData = await generateFulfillmentReport(dateRange);
                break;
            default:
                res.status(400).json({ error: 'Invalid report type' });
                return;
        }

        // Return generated report data in response
        res.status(200).json(reportData);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Generate a sales report for the specified date range
const generateSalesReport = async (dateRange: DateRange): Promise<object> => {
    // Query database for orders within the specified date range
    const orders = await Order.find({
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    });

    // Calculate total sales, number of orders, and average order value
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const numberOfOrders = orders.length;
    const averageOrderValue = totalSales / numberOfOrders;

    // Group sales data by product, category, or time period as needed
    const salesByProduct = {};
    const salesByCategory = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            salesByProduct[item.productId] = (salesByProduct[item.productId] || 0) + item.quantity;
            salesByCategory[item.category] = (salesByCategory[item.category] || 0) + item.quantity;
        });
    });

    // Return compiled sales report data
    return {
        totalSales,
        numberOfOrders,
        averageOrderValue,
        salesByProduct,
        salesByCategory
    };
};

// Generate an inventory report
const generateInventoryReport = async (): Promise<object> => {
    // Query database for all inventory items
    const inventoryItems = await InventoryItem.find();

    // Calculate total inventory value
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Identify low stock items
    const lowStockThreshold = 10; // This could be configurable
    const lowStockItems = inventoryItems.filter(item => item.quantity < lowStockThreshold);

    // Calculate inventory turnover rate if applicable
    // Note: This would require additional data on sales over time, which is not available in this context
    // const inventoryTurnoverRate = ...;

    // Return compiled inventory report data
    return {
        totalInventoryValue,
        totalItems: inventoryItems.length,
        lowStockItems: lowStockItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
        })),
        // inventoryTurnoverRate
    };
};

// Generate a fulfillment report for the specified date range
const generateFulfillmentReport = async (dateRange: DateRange): Promise<object> => {
    // Query database for fulfilled orders within the specified date range
    const fulfilledOrders = await Order.find({
        status: 'fulfilled',
        fulfilledAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    });

    const totalOrders = await Order.countDocuments({
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    });

    // Calculate average fulfillment time
    const totalFulfillmentTime = fulfilledOrders.reduce((sum, order) => {
        return sum + (order.fulfilledAt.getTime() - order.createdAt.getTime());
    }, 0);
    const averageFulfillmentTime = totalFulfillmentTime / fulfilledOrders.length;

    // Determine fulfillment rate (fulfilled orders / total orders)
    const fulfillmentRate = fulfilledOrders.length / totalOrders;

    // Identify any fulfillment bottlenecks or issues
    const longFulfillmentTimeThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const ordersWithLongFulfillmentTime = fulfilledOrders.filter(order => 
        order.fulfilledAt.getTime() - order.createdAt.getTime() > longFulfillmentTimeThreshold
    );

    // Return compiled fulfillment report data
    return {
        totalFulfilledOrders: fulfilledOrders.length,
        totalOrders,
        averageFulfillmentTime,
        fulfillmentRate,
        ordersWithLongFulfillmentTime: ordersWithLongFulfillmentTime.length
    };
};