export type CustomDesign = {
  imageUrl: string;
  publicId: string;
  fileName: string;
  placement: "Front" | "Back";
  scale: number;
  transparency: number;
  positionX: number;
  positionY: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  customDesign?: CustomDesign;
};