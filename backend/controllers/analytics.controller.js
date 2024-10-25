import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";


export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySalesData = await getDailySalesReport(startDate, endDate);

        res.status(200).json({ analyticsData, dailySalesData });

    } catch (error) {
        console.log("Error in getAnalytics controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            },
        },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };
    return { users: totalUsers, products: totalProducts, totalSales, totalRevenue };
};

const getDailySalesReport = async (startDate, endDate) => {
    const dailySalesReport = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    const dateArray = getDatesBetween(startDate, endDate);

    return dateArray.map((date) => {
        const salesReport = dailySalesReport.find((report) => report._id === date);
        return {
            date,
            sales: salesReport? salesReport.sales : 0,
            revenue: salesReport? salesReport.revenue : 0,
        };
    });
};

// function to get all dates between two dates

const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};
