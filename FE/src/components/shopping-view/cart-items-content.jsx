import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  deleteCartItem,
  updateCartQuantity,
  fetchCartItems,
} from "@/store/shop/cart-slice";
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";

function UserCartItemsContent({ cartItems }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [productDetails] = useState(null);

  // Lấy ảnh theo màu
  const currentImage = useMemo(() => {
    // Ưu tiên: Nếu có productDetails và color, lấy ảnh theo màu
    if (cartItems?.color && productDetails) {
      const colorImages = productDetails?.colorImages;
      if (colorImages) {
        if (colorImages instanceof Map || colorImages.get) {
          const colorImage = colorImages.get(cartItems.color);
          if (colorImage) return colorImage;
        }
        if (typeof colorImages === "object" && colorImages[cartItems.color]) {
          return colorImages[cartItems.color];
        }
      }
    }

    // Fallback: Dùng ảnh từ backend (đã được tính toán theo màu) hoặc ảnh mặc định
    return cartItems?.image || productDetails?.image;
  }, [cartItems, productDetails]);

  function handleUpdateQuantity(getCartItem, action) {
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        color: getCartItem?.color,
        size: getCartItem?.size,
        quantity:
          action === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          description: "Cart item updated successfully.",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
        color: getCartItem?.color,
        size: getCartItem?.size,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          description: "Cart item deleted successfully.",
        });
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={currentImage}
        alt={cartItems?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-medium">{cartItems?.title}</h3>
        {(cartItems?.color || cartItems?.size) && (
          <div className="text-sm text-muted-foreground mt-1">
            {cartItems?.color && <span>Color: {cartItems.color}</span>}
            {cartItems?.color && cartItems?.size && (
              <span className="mx-2">•</span>
            )}
            {cartItems?.size && <span>Size: {cartItems.size}</span>}
          </div>
        )}
        <div className="flex items-center mt-1 gap-2">
          <Button
            size="icon"
            className="h-5 w-5 rounded-full"
            variant="outline"
            disabled={cartItems?.quantity <= 1}
            onClick={() => handleUpdateQuantity(cartItems, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span>{cartItems?.quantity}</span>
          <Button
            size="icon"
            className="h-5 w-5 rounded-full"
            variant="outline"
            onClick={() => handleUpdateQuantity(cartItems, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          {(
            (cartItems?.salePrice > 0
              ? cartItems?.salePrice
              : cartItems?.price) * cartItems?.quantity
          ).toLocaleString("vi-VN")}{" "}
          VND
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItems)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
