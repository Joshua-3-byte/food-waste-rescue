# 🍕 Food Waste Rescue

**Reducing Food Waste, One Meal at a Time** | Aligned with UN SDG 12

## 🎯 Mission

Food Waste Rescue is a MERN full-stack application connecting restaurants with surplus food to budget-conscious customers. We combat food waste while providing affordable meals and additional revenue for restaurants.

**The Problem:** 40% of food produced globally is wasted. Restaurants throw away perfectly edible meals daily.

**Our Solution:** A real-time marketplace where restaurants post surplus food at 50-70% discount before closing time, and customers instantly reserve quality meals at unbeatable prices.

---

## 📊 About This Project

### **What is Food Waste Rescue?**

Food Waste Rescue is an MVP (Minimum Viable Product) that solves three major problems:

1. **For Restaurants:**

   - Turn unsold food into revenue
   - Reduce waste disposal costs
   - Build customer loyalty
   - No upfront investment

2. **For Customers:**

   - Access affordable, quality meals
   - Save 50-70% on restaurant food
   - Support sustainability
   - Discover new restaurants

3. **For the Environment:**
   - Reduce food waste by ~2-5 tons per restaurant/month
   - Lower carbon footprint
   - Promote circular economy

### **UN Sustainable Development Goal (SDG 12) Alignment**

**SDG 12: Responsible Consumption and Production**

Our app directly addresses:

- **Target 12.3:** Halve per capita global food waste by 2030
- **Target 12.5:** Reduce waste generation through prevention and recycling
- **Target 12.8:** Raise awareness about sustainable lifestyles

**Impact:** By 2025, we aim to redirect 10,000+ meals from landfills monthly across Nairobi and Juja.

---

## 🚀 Features (MVP)

### **For Restaurants**

- ✅ Create account with business verification
- ✅ Post surplus food listings with images
- ✅ Set custom discounts (auto-calculated)
- ✅ Real-time order notifications
- ✅ Verify customer pickup with 6-digit codes
- ✅ View incoming orders dashboard
- ✅ Track earnings
- ✅ 5-star rating system

### **For Customers**

- ✅ Register as customer
- ✅ Browse available meals in real-time
- ✅ Advanced filters (cuisine, price, dietary)
- ✅ Interactive map view with restaurant locations
- ✅ View detailed listing info
- ✅ Reserve meals instantly
- ✅ Get unique pickup codes
- ✅ Cancel orders (before pickup)
- ✅ Rate and review restaurants
- ✅ Track order history

### **General Features**

- ✅ JWT-based authentication
- ✅ Role-based access (Restaurant/Customer)
- ✅ Image uploads (Cloudinary)
- ✅ Real-time order tracking
- ✅ Responsive design (mobile-friendly)
- ✅ Production-ready deployment

---

## 💰 Revenue Model (MVP)

### **Primary Revenue Streams**

1. **Transaction Fee: 15% per order**

   - Customer buys meal for KES 500
   - Platform keeps: KES 75
   - Restaurant receives: KES 425
   - **Highly scalable**

2. **Premium Restaurant Subscription: KES 1,500/month**
   - Free tier: 5 listings/month + 20% fee
   - Premium tier: Unlimited listings + 15% fee + priority search
   - **Recurring revenue**

### **Future Revenue Opportunities** (Post-MVP)

3. **Customer Premium Subscription: KES 300/month**

   - Early access to deals (5 min before free users)
   - No service fees on orders
   - Exclusive restaurant partnerships

4. **Advertising & Partnerships:**

   - Featured restaurant placements: KES 3,000/month
   - Brand partnerships with eco-friendly companies
   - Sponsored challenges

5. **Data Analytics:**
   - Anonymized consumer trends for restaurants
   - Heat maps for food industry
   - Franchise opportunities

### **Financial Projections (Conservative)**

| Metric          | Month 1    | Month 6     | Year 1         |
| --------------- | ---------- | ----------- | -------------- |
| Restaurants     | 10         | 50          | 200+           |
| Daily Orders    | 9          | 100         | 500+           |
| Daily Revenue   | KES 540    | KES 9,000   | KES 45,000+    |
| Monthly Revenue | KES 16,200 | KES 210,000 | KES 1,350,000+ |

---

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - UI library
- **Vite** - Build tool (fast development)
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Leaflet** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet

### **Backend**

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File uploads

### **Deployment**

- **Frontend:** Netlify
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Version Control:** GitHub

---

## 📱 Live Demo

- **Frontend:** https://food-waste-rescue.netlify.app
- **Backend API:** https://food-waste-rescue.onrender.com/api

### **Test Accounts**

## 🚀 Getting Started

### **Prerequisites**

- Node.js v14+
- MongoDB Atlas account
- Cloudinary account
- Git

### **Installation (Local)**

**1. Clone Repository**

```bash
git clone
cd food-waste-rescue
```

**2. Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run dev
```

**3. Setup Frontend**

```bash
cd ../frontend
npm install
npm run dev
```

**4. Access Application**

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api

---

## 📊 Database Schema

### **Users Collection**

```javascript
{
  role: 'restaurant' | 'customer' | 'admin',
  email: String (unique),
  password: String (hashed),
  name: String,
  phone: String,

  // Restaurant-specific
  businessName: String,
  address: { street, city, coordinates: { lat, lng } },
  operatingHours: { day: { open, close } },
  verified: Boolean,
  subscriptionTier: 'free' | 'paid',

  // Customer-specific
  dietaryPreferences: [String],
  savedRestaurants: [ObjectId],

  rating: Number,
  totalRatings: Number,
  createdAt: Date
}
```

### **Listings Collection**

```javascript
{
  restaurantId: ObjectId,
  title: String,
  description: String,
  images: [{ url, publicId }],
  cuisine: String,
  dietaryTags: [String],
  originalPrice: Number,
  discountedPrice: Number,
  discountPercentage: Number,
  quantity: Number,
  quantityRemaining: Number,
  pickupWindow: { start: Date, end: Date },
  status: 'active' | 'sold_out' | 'expired',
  expiresAt: Date,
  createdAt: Date
}
```

### **Orders Collection**

```javascript
{
  customerId: ObjectId,
  restaurantId: ObjectId,
  listingId: ObjectId,
  quantity: Number,
  totalPrice: Number,
  platformFee: Number,
  restaurantEarnings: Number,
  status: 'reserved' | 'paid' | 'picked_up' | 'cancelled',
  pickupCode: String,
  paymentMethod: String,
  rating: Number,
  review: String,
  pickedUpAt: Date,
  createdAt: Date
}
```

---

## 🎯 User Flows

### **Restaurant Flow**

1. Register → Verify → Create Listings → Monitor Orders → Verify Pickups → Track Earnings

### **Customer Flow**

1. Register → Browse → Filter/Search → View Details → Reserve → Pickup → Review

### **Admin Flow** (Future)

1. Approve Restaurants → Monitor Transactions → Generate Reports → Manage Disputes

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation with express-validator
- ✅ Role-based access control
- ✅ Secure image uploads (Cloudinary)
- ✅ Environment variables for secrets

---

## 📈 Roadmap (Post-MVP)

### **Phase 2 (Q2 2024)**

- [ ] Payment integration (M-Pesa, Stripe)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Customer loyalty program

### **Phase 3 (Q3 2024)**

- [ ] AI-powered recommendations
- [ ] Bulk ordering for organizations
- [ ] Corporate partnerships
- [ ] Mobile apps (iOS/Android)

### **Phase 4 (Q4 2024)**

- [ ] Franchise model
- [ ] Multi-city expansion
- [ ] B2B supply chain integration
- [ ] Sustainability certificates

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Team

- **Developer:** [Joshua Omondi]
- **Project:** Food Waste Rescue MVP
- **Contact:** omondijoshua5674@gmail.com

---

## 🙏 Acknowledgments

- UN Sustainable Development Goals
- MongoDB Atlas for database hosting
- Render for backend deployment
- Netlify for frontend deployment
- Cloudinary for image management
- Open-source community

---

## 📞 Support

For issues, questions, or suggestions:

- **Email:** omondijoshua5674@gmail.com

---

## 🌍 Environmental Impact

**Our Goal:** By 2025, prevent **1,000 tons of food waste** annually across Kenya.

**How You Can Help:**

- Use the platform as a customer or restaurant
- Share with friends and businesses
- Provide feedback and feature requests
- Join us in the sustainability mission

---

**Together, we're making food waste a thing of the past! 🌱**

**Made with ❤️ for a sustainable future**
