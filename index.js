const express = require("express");
const connectDb = require("./app/config/dbConnection");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");

connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(cookieParser());

// app.
// (cookieParser());
app.use(
  session({
    secret: "pritam123",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.delete_msg = req.flash("delete_msg");
  next();
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static("uploads"));
app.use("/docs", express.static(path.join(__dirname, "docs")));

const csvRouter = require("./app/routes/csvRouter");
app.use(csvRouter);

const productRouter = require("./app/routes/product.route");
app.use("/products", productRouter);

const apiProductRouter = require("./app/routes/apiProductRoute");
app.use("/api/products", apiProductRouter);

const authRouter = require("./app/routes/authRoute");
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log(`server running on http://localhost:${process.env.PORT}`);
});
