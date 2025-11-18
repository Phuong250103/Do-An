import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  console.log(1111, productDetails);
  const colors = [
    ...new Set(productDetails?.variants?.map((v) => v.color) || []),
  ];
  const sizes = [
    ...new Set(productDetails?.variants?.map((v) => v.size) || []),
  ];

  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-2xl mb-5 mt-4">
              {productDetails?.description}
            </p>
            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full ${
                        selectedColor === color ? "border-2 border-black" : ""
                      }`}
                      style={{ padding: "0.15rem" }}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Color: {selectedColor}</p>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`rounded border-2 border-black ${
                        selectedSize === size
                          ? "border-black"
                          : "border-transparent"
                      }`}
                      style={{ padding: "0.15rem" }}
                      onClick={() => setSelectedSize(size)}
                    >
                      <div
                        className={`rounded px-3 py-1 ${
                          selectedSize === size
                            ? "bg-black text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {size.toUpperCase()}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Size: {selectedSize}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              {productDetails?.price.toLocaleString("vi-VN")} VND
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-2xl font-bold text-muted-foreground">
                {productDetails?.salePrice?.toLocaleString("vi-VN")} VND
              </p>
            ) : null}
          </div>
          <div>
            <Button className="w-full mt-6">Add to cart</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
