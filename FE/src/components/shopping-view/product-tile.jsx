import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";

function ShoppingProductTile({ product }) {
  const { categories, brands } = useSelector((state) => state.adminOptions);

  // Helper function to get label from name
  const getLabel = (name, options) => {
    const option = options.find((opt) => opt.name === name);
    return option ? option.label : name;
  };

  const categoryLabel = getLabel(product?.category, categories);
  const brandLabel = getLabel(product?.brand, brands);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {categoryLabel}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {brandLabel}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              {product?.price?.toLocaleString("vi-VN")} VND
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-semibold text-primary">
                {product?.salePrice?.toLocaleString("vi-VN")} VND
              </span>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Add to card</Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default ShoppingProductTile;
