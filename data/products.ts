export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  backImage: string;
  description: string;
  colors: string[];
  sizes: string[];
}

export const products: Product[] = [
  {
    id: "black-hoodie",
    name: "Black Oversized Hoodie",
    price: 4499,
    category: "Hoodies",
    image: "/images/products/black-hoodie.png",
    backImage: "/images/products/black-hoodie-back.png",
    description: "A premium black oversized hoodie, ready for your personal design.",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "black-sweatshirt",
    name: "Black Oversized Sweatshirt",
    price: 3999,
    category: "Sweatshirts",
    image: "/images/products/black-sweatshirt.png",
    backImage: "/images/products/black-sweatshirt-back.png",
    description: "A comfortable oversized sweatshirt designed for custom printing.",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "printed-black-hoodie",
    name: "Printed Black Hoodie",
    price: 4799,
    category: "Our Creations",
    image: "/images/products/printed-black-hoodie.png",
    backImage: "/images/products/black-hoodie-back.png",
    description: "An example of custom artwork printed on our black oversized hoodie.",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "printed-black-sweatshirt",
    name: "Printed Black Sweatshirt",
    price: 4299,
    category: "Our Creations",
    image: "/images/products/printed-black-sweatshirt.png",
    backImage: "/images/products/black-sweatshirt-back.png",
    description: "An example of custom artwork printed on our black oversized sweatshirt.",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
  },
];