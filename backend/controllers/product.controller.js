import Product from '../models/product.model.js';
import { redis } from '../lib/redis.js';
import cloudinary from '../lib/cloudinary.js';


export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ products });
    } catch (error) {
        console.log('Error in get all products controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        // Fetch featured products from Redis if available,
        let  featuredProducts = await redis.get('featured_products');
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }
        // otherwise fetch from MongoDB  
        // lean() returns a plain JavaScript object instead of a Mongoose document which is more memory efficient
        featuredProducts = await Product.find({ isFeatured: true }).lean();;
        if (!featuredProducts) {
            return res.status(404).json({ message: 'No featured products found' });
        }
        // store in Redis for future use
        await redis.set('featured_products', JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log('Error in get featured products controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        let uploadResponse = null;
        if (image) {
            uploadResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }   
        const product = await Product.create({
            name,
            description,
            price,
            image: uploadResponse.secure_url ? uploadResponse.secure_url : "",  // if image is not provided, use empty string in MongoDB
            category
        });
        res.status(201).json(product);
    } catch (error) {
        console.log('Error in create product controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.image) {
            const imageId = product.image.split('/').pop().split('.').shift();
            try {
                await cloudinary.uploader.destroy('products/' + imageId);
            } catch (error) {
                console.log('Error deleting image from cloudinary', error.message);
            }
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.log('Error in delete product controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: {
                    size: 4
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        ]);
        if (!products) {
            return res.status(404).json({ message: 'No recommended products found' });
        }
        res.json(products);
    } catch (error) {
        console.log('Error in get recommended products controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });
        res.json({ products });
    } catch (error) {
        console.log('Error in get products by category controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        // const updatedProduct = await Product.findByIdAndUpdate(
        //     req.params.id,
        //     { $set: { isFeatured: { $not: "$isFeatured" } } }, // toggle isFeatured
        //     { new: true } // return updated document
        // );
        // if (!updatedProduct) {
        //     return res.status(404).json({ message: 'Product not found' });
        // }
        // Update Redis featured products cache
        // const featuredProducts = await Product.find({ isFeatured: true }).lean();
        // await redis.set('featured_products', JSON.stringify(featuredProducts));

        // res.json(updatedProduct);

        const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			const featuredProducts = await Product.find({ isFeatured: true }).lean();
		    await redis.set("featured_products", JSON.stringify(featuredProducts));
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
    } catch (error) {
        console.log('Error in toggle featured product controller', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, category } = req.body;
        let uploadResponse = null;
        if (image) {
            uploadResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            image: uploadResponse.secure_url ? uploadResponse.secure_url : "",
            category
        }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
        
    } catch (error) {
        console.log('Error in update product controller', error.message);
        res.status(500).json({ message: error.message });
    }
};