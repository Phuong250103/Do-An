export const resgisterFormControls = [
  {
    name: "userName",
    label: "User Name",
    type: "text",
    placeholder: "Enter your username",
    componentType: "input",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter your email",
    componentType: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    componentType: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter your email",
    componentType: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    componentType: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Season",
    name: "season",
    componentType: "select",
    options: [
      { id: "spring", label: "Spring" },
      { id: "summer", label: "Summer" },
      { id: "autumn", label: "Autumn" },
      { id: "winter", label: "Winter" },
    ],
  },
  {
    label: "Discount After Season (%)",
    name: "discountAfterSeason",
    componentType: "input",
    type: "number",
    placeholder: "Enter discount percentage (default: 70)",
  },
];
export const shoppingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "man", label: "Man", path: "/shop/listing" },
  { id: "women", label: "Women", path: "/shop/listing" },
  { id: "kids", label: "Kids", path: "/shop/listing" },
  { id: "footwear", label: "Footwear", path: "/shop/listing" },
  { id: "accessories", label: "Accessories", path: "/shop/listing" },
];

export const filterOptions = {
  category: [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "kids", label: "Kids" },
    { id: "accessories", label: "Accessories" },
    { id: "footwear", label: "Footwear" },
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "levi", label: "Levi's" },
    { id: "zara", label: "Zara" },
    { id: "h&m", label: "H&M" },
  ],
};

export const sortOptions = [
  {
    id: "price-lowtohigh",
    label: "Price: Low to High",
    compareFn: (a, b) => {
      const aPrice = a.salePrice > 0 ? a.salePrice : a.price;
      const bPrice = b.salePrice > 0 ? b.salePrice : b.price;
      return aPrice - bPrice;
    },
  },
  {
    id: "price-hightolow",
    label: "Price: High to Low",
    compareFn: (a, b) => {
      const aPrice = a.salePrice > 0 ? a.salePrice : a.price;
      const bPrice = b.salePrice > 0 ? b.salePrice : b.price;
      return bPrice - aPrice;
    },
  },
  {
    id: "title-atoz",
    label: "Title: A to Z",
    compareFn: (a, b) => a.title.localeCompare(b.title),
  },
  {
    id: "title-ztoa",
    label: "Title: Z to A",
    compareFn: (a, b) => b.title.localeCompare(a.title),
  },
];

export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
  footwear: "Footwear",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
