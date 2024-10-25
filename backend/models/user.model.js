import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."]
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address."
        }
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [8, "Password must be at least 8 characters long."],
    },
    cartItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                // required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                validate: {
                    validator: function(v) {
                        return Number.isInteger(v) && v > 0;
                    },
                    message: "Quantity must be a positive integer."
                },
                min: 1
            }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
},
    {timestamps: true} // Automatically adds createdAt and updatedAt fields
);

userSchema.pre("save", async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;