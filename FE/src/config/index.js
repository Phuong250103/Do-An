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
    label: "Size",
    name: "size",
    componentType: "select",
    options: [
      { id: "l", label: "L" },
      { id: "m", label: "M" },
      { id: "xl", label: "XL" },
      { id: "xx", label: "XX" },
      { id: "s", label: "S" },
    ],
  },
  {
    label: "Color",
    name: "color",
    componentType: "select",
    options: [
      { id: "red", label: "Red" },
      { id: "orange", label: "Orange" },
      { id: "purple", label: "Purple" },
      { id: "blue", label: "Blue" },
      { id: "green", label: "Green" },
      { id: "white", label: "white" },
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
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
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
];
export const shoppingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "man", label: "Man", path: "/shop/listing" },
  { id: "women", label: "Women", path: "/shop/listing" },
  { id: "kids", label: "Kids", path: "/shop/listing" },
  { id: "footwear", label: "Footwear", path: "/shop/listing" },
  { id: "accessories", label: "Accessories", path: "/shop/listing" },
];
