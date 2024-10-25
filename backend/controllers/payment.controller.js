import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;
        const user = req.user;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Please provide products" });
        }
        
        let totalPrice = 0;

        const lineItems = products.map((product) => {
            totalPrice += product.price * product.quantity;
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: product.price * 100, // Convert to cents
                },
                quantity: product.quantity || 1,
            };
        });
        
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: user._id, isActive: true });
            if (coupon) {
                totalPrice -= totalPrice * (coupon.discountPercentage / 100);
            }
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }] : [],
            metadata: {
                userId: user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(products.map((product) => ({
                    id: product._id,
                    price: product.price,
                    quantity: product.quantity,
                }))),
            },
        });

        if (totalPrice >= 200) {
            await createNewCoupon(user._id);
        }
        res.status(200).json({ id: session.id, totalAmount: totalPrice });
        
    } catch (error) {
        console.log("Error in createCheckoutSession controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === "paid") {
            const { userId, couponCode, products } = session.metadata;
            if (couponCode) {
                await Coupon.findOneAndUpdate(
                    { code: couponCode, userId: userId },
                    { isActive: false }
                );
            }

            const order = new Order({
                user: userId,
                products: JSON.parse(products).map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
                totalAmount: session.amount_total / 100,
                stripeSessionId: sessionId,   
            });
            await order.save();

            res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: order._id,
			});
        }
    } catch (error) {
        console.log("Error in checkoutSuccess controller", error.message);
        res.status(500).json({ message: error.message });
    }
};


async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
        currency: "usd",
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({ userId: userId });

    const newCoupon = new Coupon({
        userId: userId,
        code: "GIFT" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now,
        isActive: true,
    });
    await newCoupon.save();

}
