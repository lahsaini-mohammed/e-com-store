import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const user = req.user;

        const products = await Product.find({ _id: { $in: user.cartItems } });

        const cartItems = products.map( (product) => {
            const item = user.cartItems.find( (item) => item.id === product.id ); // to add quantity to each product
            return { ...product.toJSON(), quantity: item.quantity };
        });
        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const user = req.user;
        // const productId = req.body.productId;
        const { productId } = req.body;

        const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push(productId);
            console.log(user.cartItems);
		}

		await user.save();
		res.json(user.cartItems);
        
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const user = req.user;
        const productId = req.params.productId;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter( (item) => item.id !== productId );
        }

        await user.save();
        res.json(user.cartItems);
        
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const user = req.user;
        const productId = req.params.id;
        const quantity = req.body.quantity;

        const existingItem = user.cartItems.find( (item) => item.id === productId );
        
        if (!existingItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        if (quantity === 0) {
            user.cartItems = user.cartItems.filter( (item) => item.id!== productId );
        } else {
            existingItem.quantity = quantity;
        }
        
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: error.message });
    }
};
