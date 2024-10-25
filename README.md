# Modern E-commerce Platform

A full-stack e-commerce store built with React.js for the frontend, Node.js and Express for the backend API, MongoDB as the database, and Redis for caching, featuring authentication, product management, shopping cart functionality, Stripe integration for payments, coupon usage, and analytics dashboards.

## 🌟 Features

- **User Authentication**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing with bcrypt
  - Role-based authorization (Admin/Customer)
  - Redis-backed token management

- **Product Management**
  - CRUD operations for products (Admin)
  - Category-based product organization
  - Featured products system (cached in Redis)
  - Image storage with Cloudinary
  - Product recommendations for upsaling

- **Shopping Experience**
  - Interactive shopping cart
  - Real-time price calculations
  - Coupon system with automatic generation
  - Secure Stripe payment integration
  - Success or cancel page, providing feedback on their transaction

- **Admin Dashboard**
  - Sales analytics with visual charts
  - Product management interface

## 🏗️ Architecture

### System Overview

The e-commerce application follows a client-server architecture. The frontend (React.js) acts as the client, making requests to the backend API (Node.js and Express). The backend API interacts with the MongoDB database and Redis cache to process requests and return data to the frontend.

```mermaid
graph TD
    Client[React Frontend]
    API[Express Backend]
    DB[(MongoDB)]
    Cache[(Redis)]
    Storage[Cloudinary]
    Payment[Stripe]

    Client <--> API
    API <--> DB
    API <--> Cache
    API <--> Storage
    API <--> Payment
```

### Technical Stack

#### Frontend
- **React.js** - UI framework
- **React Router Dom** - Pages navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Analytics visualization
- **Framer Motion** - Animations
- **Lucid React** - Icons
- **React hot toast** - Notifications
- **React confetti** - Celebratory effects

#### Backend
- **Node.js & Express** - Server framework
- **MongoDB (Atlas)** - Database
- **Mongoose** - Object Data Modeling
- **Redis (Upstash)** - Caching & token management
- **JWT** - Authentication
- **bcrypt.js** - Passwords Hashing
- **Cookie Parser** - manage cookies
- **Stripe** - Payment processing
- **Cloudinary** - Image storage




### Primary Architectural Patterns

#### 1. MVC (Model-View-Controller) Pattern in Backend
The backend follows the MVC architectural pattern with a RESTful API implementation:

```mermaid
graph TD
    Client[Client Request] --> Controller
    Controller --> Model
    Model --> Database[(Database)]
    Controller --> Response[Client Response]
    
    subgraph Backend
        Controller[Controllers]
        Model[Models]
    end
```

##### Components:
- **Models** (`/backend/models/`)
  - Represent data structures and business logic
  - Handle database interactions
  - Examples: `user.model.js`, `product.model.js`

- **Controllers** (`/backend/controllers/`)
  - Handle request/response logic
  - Process business operations
  - Examples: `auth.controller.js`, `product.controller.js`

- **Routes** (`/backend/routes/`)
  - Define API endpoints
  - Map URLs to controller functions
  - Examples: `auth.route.js`, `product.route.js`

#### 2. Flux-like Pattern in Frontend (using Zustand)
The frontend implements a Flux-like pattern through Zustand stores:

```mermaid
graph LR
    Action[User Action] --> Store[Zustand Store]
    Store --> Component[React Component]
    Component --> Action
```

##### Components:
- **Stores** (`/frontend/src/stores/`)
  - Central state management
  - Handle state updates
  - Examples: `useCartStore.js`, `useProductStore.js`

- **Components** (`/frontend/src/components/`)
  - Presentation logic
  - User interaction handlers
  - Examples: `ProductCard.jsx`, `CartItem.jsx`

- **Pages** (`/frontend/src/pages/`)
  - Route-level components
  - Compose multiple components
  - Examples: `HomePage.jsx`, `CartPage.jsx`

### Secondary Design Patterns

#### 1. Repository Pattern
Implemented through Mongoose models:
```javascript
// Example from product.model.js
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    // ...
});
```

#### 2. Middleware Pattern
Used for cross-cutting concerns:
```javascript
// Example from auth.middleware.js
const protectRoute = async (req, res, next) => {
    // Authentication logic
    next();
};
```

### REST API Design

The API follows REST principles:

#### 1. Resource Naming
- Uses nouns for resources
- Follows hierarchical structure
```
/products              # Product collection
/products/:id          # Single product
```

#### 2. HTTP Methods
- GET: Retrieve resources
- POST: Create resources
- PUT/PATCH: Update resources
- DELETE: Remove resources

#### 3. Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### Code Structure Analysis

```
backend/
├── controllers/       # MVC Controllers
├── models/           # MVC Models
├── routes/           # Route Definitions
├── middleware/       # Cross-cutting Concerns
└── lib/             # External Service Integration

frontend/
├── src/
│   ├── components/   # Reusable UI Components
│   ├── pages/        # Route Components
│   ├── stores/       # State Management
│   └── lib/         # Utility Functions
└── public/          # Static Assets
```

### Design Principles Applied

#### 1. Separation of Concerns (SoC)
- Backend logic separated from frontend
- Clear distinction between models, controllers, and routes
- Separate stores for different state domains

#### 2. Single Responsibility Principle (SRP)
- Each controller handles one resource type
- Components focus on specific UI elements
- Stores manage specific state domains

#### 3. DRY (Don't Repeat Yourself)
- Shared utilities and middleware
- Reusable components
- Centralized state management


### Communication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Component
    participant Store
    participant API
    participant Controller
    participant Model
    participant Database

    Client->>Component: User Action
    Component->>Store: Update State
    Store->>API: HTTP Request
    API->>Controller: Route Handler
    Controller->>Model: Data Operation
    Model->>Database: Query
    Database-->>Model: Result
    Model-->>Controller: Data
    Controller-->>API: Response
    API-->>Store: Updated Data
    Store-->>Component: New State
    Component-->>Client: UI Update
```

## 🔄 Core Workflows

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant US as UserStore
    participant AI as Axios Interceptor
    participant B as Backend
    participant M as MongoDB
    participant R as Redis

    %% Signup Flow
    rect rgba(200, 230, 200, 0)
    Note over U,R: User Signup Process
    U->>F: Enter signup details
    F->>F: Validate passwords match
    alt Passwords Don't Match
        F-->>U: Show error toast
    else Passwords Match
        F->>US: signup(userData)
        US->>B: POST /auth/signup
        B->>M: Check email exists
        alt Email Exists
            M-->>B: User found
            B-->>US: Error: Email taken
            US-->>F: Show error
        else Email Available
            B->>B: Hash password
            B->>M: Create user
            M-->>B: User created
            B->>B: Generate tokens
            B->>R: Store refresh token
            B-->>US: Set cookies & user data
            US->>US: Update user state
            US-->>F: Redirect user
            F-->>U: Show success
        end
    end
    end

    %% Login Flow
    rect rgba(230, 200, 200, 0)
    Note over U,R: User Login Process
    U->>F: Enter credentials
    F->>US: login(email, password)
    US->>B: POST /auth/login
    B->>M: Find user by email
    M-->>B: User details
    B->>B: Compare password
    alt Invalid Credentials
        B-->>US: Error 400
        US-->>F: Show error
        F-->>U: Display message
    else Valid Credentials
        B->>B: Generate tokens
        B->>R: Store refresh token
        B-->>US: Set cookies & user data
        US->>US: Update user state
        US-->>F: Redirect user
        F-->>U: Show success
    end
    end

    %% Protected Route Access
    rect rgba(200, 200, 230, 0)
    Note over U,R: Protected Route Access
    U->>F: Access protected route
    F->>B: Request with access token
    B->>B: protectRoute middleware
    B->>B: Verify access token
    alt Token Valid
        B->>M: Fetch user
        M-->>B: User details
        B->>B: Add user to request
        B-->>F: Protected resource
        F-->>U: Display content
    else Token Invalid/Expired
        B-->>F: Error 401
        F->>AI: Trigger interceptor
        AI->>US: refreshToken()
        US->>B: POST /auth/refresh-token
        B->>R: Verify refresh token
        alt Refresh Token Valid
            R-->>B: Token exists
            B->>B: Generate new access token
            B-->>US: Set new access token
            US->>F: Retry original request
            F-->>U: Display content
        else Refresh Token Invalid
            R-->>B: Token not found
            B-->>US: Error 401
            US->>US: Clear user state
            US-->>F: Redirect to login
            F-->>U: Show login page
        end
    end
    end

    %% Logout Flow
    rect rgba(230, 230, 200, 0)
    Note over U,R: User Logout Process
    U->>F: Click logout
    F->>US: logout()
    US->>B: POST /auth/logout
    B->>R: Delete refresh token
    R-->>B: Token deleted
    B-->>US: Clear cookies
    US->>US: Clear user state
    US-->>F: Redirect to login
    F-->>U: Show login page
    end

    %% Admin Route Access
    rect rgba(200, 230, 230, 0)
    Note over U,R: Admin Route Access
    U->>F: Access admin route
    F->>B: Request with access token
    B->>B: protectRoute middleware
    B->>B: adminRoute middleware
    B->>B: Check user role
    alt Role is Admin
        B-->>F: Admin resource
        F-->>U: Display admin content
    else Not Admin
        B-->>F: Error 403
        F-->>U: Show forbidden message
    end
    end
```

### Product Management Flow

```mermaid
sequenceDiagram
    participant U as User/Admin
    participant F as Frontend
    participant PS as ProductStore
    participant B as Backend
    participant M as MongoDB
    participant R as Redis
    participant C as Cloudinary

    %% Product Creation Flow
    rect rgba(200, 230, 200,0)
    Note over U,C: Product Creation (Admin Only)
    U->>F: Fill CreateProductForm
    F->>PS: createProduct(productData)
    PS->>B: POST /products
    B->>B: Check admin middleware
    alt Not Admin
        B-->>PS: Error 403
        PS-->>F: Show error
    else Is Admin
        B->>C: Upload product image
        C-->>B: Image URL
        B->>M: Create product
        M-->>B: Product created
        B-->>PS: New product data
        PS->>PS: Update store
        PS-->>F: Update UI
        F-->>U: Show success
    end
    end

    %% Fetch Products Flows
    rect rgba(230, 200, 200, 0)
    Note over U,C: Fetching Products
    
    %% All Products (Admin)
    U->>F: Access admin products page
    F->>PS: fetchAllProducts()
    PS->>B: GET /products
    B->>B: Check admin middleware
    alt Is Admin
        B->>M: Fetch all products
        M-->>B: Products data
        B-->>PS: Products list
        PS->>PS: Update store
        PS-->>F: Render ProductsList
    else Not Admin
        B-->>PS: Error 403
        PS-->>F: Show error
    end

    %% Featured Products
    U->>F: Visit home page
    F->>PS: fetchFeaturedProducts()
    PS->>B: GET /products/featured
    B->>R: Check cache
    alt Cache Hit
        R-->>B: Cached products
    else Cache Miss
        B->>M: Fetch featured products
        M-->>B: Products data
        B->>R: Update cache
        R-->>B: Cache updated
    end
    B-->>PS: Featured products
    PS->>PS: Update store
    PS-->>F: Render FeaturedProducts
    F-->>U: Display products

    %% Category Products
    U->>F: Visit category page
    F->>PS: fetchProductsByCategory(category)
    PS->>B: GET /products/category/:category
    B->>M: Query by category
    M-->>B: Category products
    B-->>PS: Products list
    PS->>PS: Update store
    PS-->>F: Render CategoryPage
    F-->>U: Display products
    end

    %% Update Featured Status Flow
    rect rgba(200, 200, 230, 0)
    Note over U,C: Toggle Featured Status (Admin Only)
    U->>F: Click star icon
    F->>PS: toggleFeaturedProduct(id)
    PS->>B: PATCH /products/:id
    B->>B: Check admin middleware
    alt Is Admin
        B->>M: Update featured status
        M-->>B: Updated product
        B->>R: Invalidate featured cache
        B->>R: Update featured cache
        R-->>B: Cache updated
        B-->>PS: Updated product
        PS->>PS: Update store
        PS-->>F: Update UI
        F-->>U: Show success
    else Not Admin
        B-->>PS: Error 403
        PS-->>F: Show error
    end
    end

    %% Delete Product Flow
    rect rgba(230, 230, 200, 0)
    Note over U,C: Delete Product (Admin Only)
    U->>F: Click delete icon
    F->>PS: deleteProduct(id)
    PS->>B: DELETE /products/:id
    B->>B: Check admin middleware
    alt Is Admin
        B->>M: Delete product
        B->>C: Delete image
        C-->>B: Image deleted
        M-->>B: Product deleted
        B->>R: Invalidate caches
        R-->>B: Cache updated
        B-->>PS: Success response
        PS->>PS: Remove from store
        PS-->>F: Update UI
        F-->>U: Show success
    else Not Admin
        B-->>PS: Error 403
        PS-->>F: Show error
    end
    end

    %% Recommended Products Flow
    rect rgba(200, 230, 230, 0)
    Note over U,C: Fetch Recommended Products
    U->>F: View product details
    F->>PS: getRecommendedProducts()
    PS->>B: GET /products/recommendations
    B->>M: Aggregate random products
    M-->>B: Recommended products
    B-->>PS: Products list
    PS->>PS: Update store
    PS-->>F: Render recommendations
    F-->>U: Display recommendations
    end
```
   

### Shopping Cart Flow

```mermaid
sequenceDiagram
    participant U as User
    participant PC as ProductCard
    participant CP as CartPage
    participant CI as CartItem
    participant GC as GiftCouponCard
    participant CS as CartStore
    participant B as Backend
    participant DB as Database

    %% Adding to Cart Flow
    rect rgba(200, 230, 200,0)
    Note over U,DB: Adding Products to Cart
    U->>PC: Click "Add to Cart"
    PC->>PC: Check if user logged in
    alt User Not Logged In
        PC-->>U: Show error toast
    else User Logged In
        PC->>CS: addToCart(productId)
        CS->>B: POST /cart
        B->>DB: Get user's cart
        B->>B: Check if product exists
        alt Product Exists
            B->>B: Increment quantity
        else Product New
            B->>B: Add product (qty=1)
        end
        B->>DB: Save updated cart
        DB-->>B: Confirmation
        B-->>CS: Updated cart data
        CS->>CS: Update state & recalculate
        CS-->>PC: Render updates
        PC-->>U: Show success message
    end
    end

    %% Viewing Cart Flow
    rect rgba(230, 200, 200, 0)
    Note over U,DB: Viewing Cart
    U->>CP: Navigate to cart page
    CP->>CS: getCartItems()
    CS->>B: GET /cart
    B->>DB: Get user's cartItems
    B->>DB: Fetch product details
    DB-->>B: Cart & product data
    B-->>CS: Detailed cart items
    CS->>CS: Update cart state
    CS-->>CP: Render cart items
    CP-->>U: Display cart page
    end

    %% Updating Quantity Flow
    rect rgba(200, 200, 230, 0)
    Note over U,DB: Updating Product Quantity
    U->>CI: Click +/- buttons
    CI->>CS: updateQuantity(productId, qty)
    CS->>B: PUT /cart/:id
    B->>DB: Find cart item
    B->>B: Update quantity
    alt Quantity = 0
        B->>B: Remove item
    end
    B->>DB: Save updates
    DB-->>B: Confirmation
    B-->>CS: Updated cart data
    CS->>CS: Update state & recalculate
    CS-->>CI: Render updates
    CI-->>U: Show updated quantity
    end

    %% Removing Products Flow
    rect rgba(230, 230, 200,0)
    Note over U,DB: Removing Products
    U->>CI: Click remove button
    CI->>CS: removeFromCart(productId)
    CS->>B: DELETE /cart
    B->>DB: Get user's cart
    B->>B: Filter out product
    B->>DB: Save updated cart
    DB-->>B: Confirmation
    B-->>CS: Updated cart data
    CS->>CS: Update state & recalculate
    CS-->>CP: Re-render cart page
    CP-->>U: Show updated cart
    end

    %% Applying Coupons Flow
    rect rgba(200, 230, 230,0)
    Note over U,DB: Applying Coupons
    U->>GC: Enter coupon & submit
    GC->>CS: applyCoupon(code)
    CS->>B: POST /coupons/validate
    B->>DB: Validate coupon
    DB-->>B: Coupon details
    B-->>CS: Coupon validation result
    alt Valid Coupon
        CS->>CS: Update coupon state
        CS->>CS: Recalculate total
        CS-->>GC: Show success message
    else Invalid Coupon
        CS-->>GC: Show error message
    end
    GC-->>U: Display result
    end
```

### Payment workflow
  
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant CS as CartStore
    participant B as Backend
    participant S as Stripe
    participant DB as Database

    %% Coupon Application Flow
    rect rgba(0, 0, 0, 0)
    Note over U,DB: Coupon Application Flow
    U->>F: Enters coupon code
    F->>CS: applyCoupon()
    CS->>B: POST /coupons/validate
    B->>DB: Query coupon
    DB-->>B: Coupon details
    B->>B: Validate coupon
    B-->>CS: Return coupon details/error
    CS->>F: Update cart state
    F-->>U: Show updated total with discount
    end

    %% Checkout Initiation Flow
    rect rgba(0, 0, 0, 0)
    Note over U,DB: Checkout Initiation Flow
    U->>F: Click "Proceed to Checkout"
    F->>B: POST /payments/create-checkout-session
    B->>B: Validate products
    B->>B: Calculate total
    opt Has Valid Coupon
        B->>B: Apply coupon discount
    end
    B->>S: Create Stripe session
    opt Total >= $200
        B->>DB: Create new coupon
    end
    S-->>B: Session ID
    B-->>F: Return session ID
    F->>S: Redirect to Stripe checkout
    S-->>U: Display checkout page
    end

    %% Purchase Completion Flow
    rect rgba(0, 0, 0, 0)
    Note over U,DB: Purchase Completion Flow
    U->>S: Complete payment
    S->>F: Redirect to success page
    F->>B: POST /payments/checkout-success
    B->>S: Verify session
    S-->>B: Session details
    alt Payment Status: Paid
        B->>DB: Deactivate used coupon
        B->>DB: Create order document
        B-->>F: Success response
        F->>CS: Clear cart
        F-->>U: Show success message
    else Payment Failed
        B-->>F: Error response
        F-->>U: Show error message
    end
    end

    %% Coupon Viewing Flow
    rect rgba(0, 0, 0, 0)
    Note over U,DB: Coupon Viewing Flow
    U->>F: View available coupons
    F->>B: GET /coupons
    B->>DB: Query active coupons
    DB-->>B: Active coupon details
    B-->>F: Return coupon info
    F-->>U: Display coupon details
    end
```

## 🔐 Security Measures

- HTTP-only cookies for tokens
- Password hashing with bcrypt
- Role-based access control
- Redis-based token management
- Secure payment handling via Stripe
- Input validation and sanitization

## 💾 Data Models

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String password
        +Array cartItems
        +String role
        +Date createdAt
        +Date updatedAt
        +comparePassword()
    }

    class Product {
        +String name
        +String description
        +Number price
        +String image
        +String category
        +Boolean isFeatured
        +Date createdAt
        +Date updatedAt
    }

    class Order {
        +ObjectId user
        +Array products
        +Number totalAmount
        +String stripeSessionId
        +Date createdAt
        +Date updatedAt
    }

    class Coupon {
        +String code
        +Number discountPercentage
        +Date expirationDate
        +Boolean isActive
        +ObjectId userId
        +Date createdAt
        +Date updatedAt
    }

    class CartItem {
        +ObjectId product
        +Number quantity
    }

    class OrderProduct {
        +ObjectId product
        +Number quantity
        +Number price
    }

    User "1" -- "*" CartItem : contains
    CartItem "*" -- "1" Product : references
    User "1" -- "*" Order : places
    Order "*" -- "*" Product : includes
    User "1" -- "0..1" Coupon : owns
    Order "*" -- "*" OrderProduct : contains
    OrderProduct "*" -- "1" Product : references
```

### User Schema
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (enum: ["customer", "admin"]),
  cartItems: [{
    product: ObjectId,
    quantity: Number
  }]
}
```

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  isFeatured: Boolean
}
```

### Order Schema
```javascript
{
  user: ObjectId,
  products: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  stripeSessionId: String
}
```

### Coupon Schema
```javascript
{
  code: String,
  discountPercentage: Number,
  expirationDate: Date,
  isActive: Boolean,
  userId: ObjectId
}
```

## 🚀 State Management

### Zustand Store Structure
- `useUserStore` - Authentication state
- `useCartStore` - Shopping cart state and Coupon management
- `useProductStore` - Product management

## 📊 Analytics System

- Real-time sales tracking
- Revenue analytics

## 🔄 Caching Strategy

- Featured products caching
- Authentication token caching
- User session management

## 🛠️ Error Handling

- Toast notifications for user feedback

## 📦 Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_uri
UPSTASH_REDIS_URL=your_redis_url

# Authentication
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# External Services
STRIPE_SECRET_KEY=your_stripe_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# For Deployment. it's used in stripe when creating checkout session (success_url and cancel_url)
CLIENT_URL=URL_to_Your dployed_app
```