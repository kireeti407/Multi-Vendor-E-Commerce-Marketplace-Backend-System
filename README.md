
# Multi-Vendor E-Commerce Marketplace

This is a full-stack multi-vendor e-commerce marketplace platform, enabling vendors to manage their stores and products, and customers to shop from a wide range of products. The project is built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and features robust authentication, order management, reviews, and more.

## Features
- Vendor and customer authentication (JWT, role-based)
- Vendor store management (products, orders, analytics)
- Admin dashboard for platform management
- Product catalog with categories, search, and filters
- Shopping cart and checkout
- Order tracking and history
- Product reviews and ratings
- Discount and featured product support
- Responsive UI with modern design

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Authentication:** JWT, role-based access
- **Other:** Cloudinary (for images), RESTful APIs

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### Setup
1. **Clone the repository:**
	```bash
	git clone https://github.com/your-username/your-repo.git
	cd your-repo
	```
2. **Install dependencies:**
	```bash
	cd backend
	npm install
	cd ../frontend
	npm install
	```
3. **Configure environment variables:**
	- Copy `.env.example` to `.env` in both `backend` and `frontend` (if needed) and fill in required values.
4. **Start the backend server:**
	```bash
	cd backend
	npm run dev
	```
5. **Start the frontend app:**
	```bash
	cd frontend
	npm run dev
	```
6. **Visit** `http://localhost:5173` in your browser.

## Folder Structure

```
project/
  backend/      # Express.js API, models, routes, controllers
  frontend/     # React.js app, components, pages, services
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

