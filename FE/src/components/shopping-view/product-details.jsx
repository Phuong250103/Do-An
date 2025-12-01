import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { StarIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  function handleAddtoCart(getCurrentProductId) {
    if (!selectedColor || !selectedSize) {
      toast({
        description: "Vui lòng chọn màu và size.",
        variant: "destructive",
      });
      return;
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          description: "Product added to cart successfully.",
        });
        setOpen(false);
      }
    });
  }

  const colors = useMemo(() => {
    return [...new Set(productDetails?.variants?.map((v) => v.color) || [])];
  }, [productDetails?.variants]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open && productDetails?.variants && colors.length > 0) {
      const firstColor = colors[0];
      const firstSizes = [
        ...new Set(
          productDetails.variants
            .filter((v) => v.color === firstColor)
            .map((v) => v.size)
        ),
      ];
      setSelectedColor(firstColor);
      setSelectedSize(firstSizes[0] || null);
      setQuantity(1);
    } else if (open && (!productDetails?.variants || colors.length === 0)) {
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [open, productDetails, colors]);

  // Lọc sizes có sẵn cho màu đã chọn
  const availableSizes = useMemo(() => {
    if (!selectedColor || !productDetails?.variants) return [];
    return [
      ...new Set(
        productDetails.variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
      ),
    ];
  }, [selectedColor, productDetails]);

  // Tự động chọn size đầu tiên có sẵn khi chọn màu
  useEffect(() => {
    if (selectedColor && availableSizes.length > 0) {
      if (!selectedSize || !availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0]);
      }
    } else {
      setSelectedSize(null);
    }
  }, [selectedColor, availableSizes, selectedSize]);

  const selectedVariant = useMemo(() => {
    if (!productDetails?.variants || !selectedColor || !selectedSize)
      return null;
    return productDetails.variants.find(
      (variant) =>
        variant.color === selectedColor && variant.size === selectedSize
    );
  }, [productDetails, selectedColor, selectedSize]);

  const maxQuantity =
    selectedVariant && typeof selectedVariant.quantity === "number"
      ? selectedVariant.quantity
      : 0;

  useEffect(() => {
    if (maxQuantity > 0 && quantity > maxQuantity) {
      setQuantity(maxQuantity);
    } else if (maxQuantity === 0) {
      setQuantity(0);
    } else if (quantity === 0 && maxQuantity > 0) {
      setQuantity(1);
    }
  }, [maxQuantity, quantity]);

  const incrementQuantity = () => {
    if (maxQuantity > 0) {
      setQuantity((prev) => Math.min(prev + 1, maxQuantity));
    }
  };
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  // Lấy ảnh theo màu được chọn
  const currentImage = useMemo(() => {
    if (!selectedColor || !productDetails) {
      return productDetails?.image;
    }

    const colorImages = productDetails?.colorImages;
    if (colorImages) {
      if (colorImages instanceof Map || colorImages.get) {
        return colorImages.get(selectedColor) || productDetails?.image;
      }
      if (typeof colorImages === "object" && colorImages[selectedColor]) {
        return colorImages[selectedColor];
      }
    }

    return productDetails?.image;
  }, [selectedColor, productDetails]);

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={currentImage}
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
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {availableSizes.map((size) => (
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
                <p className="text-sm text-gray-500">
                  Size: {selectedSize || "Chưa chọn"}
                </p>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full bg-gray-100 px-4 py-2 text-xl">
                  <button
                    className="px-2 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || maxQuantity === 0}
                  >
                    –
                  </button>
                  <span className="px-4 text-lg font-semibold">{quantity}</span>
                  <button
                    className="px-2 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={incrementQuantity}
                    disabled={maxQuantity === 0 || quantity >= maxQuantity}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {maxQuantity === 0
                    ? "Hết hàng"
                    : `Còn ${maxQuantity} sản phẩm`}
                </p>
              </div>
            </div>
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            </div>
            <span className="text-sm text-yellow-500">(4.5)</span>
          </div>
          <div>
            <Button
              onClick={() => handleAddtoCart(productDetails?._id)}
              className="w-full mt-4"
              disabled={maxQuantity === 0 || !selectedSize}
            >
              {maxQuantity === 0 ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
          <Separator />
          <div className="max-h-[120px] overflow-auto">
            <h2 className="text-xl font-bold mb-4"> Reviews </h2>
            <div className="grid gap-6">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">PhuongDD</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      This is an amazing product
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Input type="text" placeholder="Write a review ...." />
              <Button>Submit</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
