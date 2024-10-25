import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Please provide the user."],
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: [true, "Please provide the product."],
				},
				quantity: {
					type: Number,
					required: [true, "Please provide the quantity of the product."],
					min: 1,
				},
				price: {
					type: Number,
					required: [true, "Please provide the price of the product."],
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: [true, "Please provide the total amount."],
			min: 0,
		},
		stripeSessionId: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;