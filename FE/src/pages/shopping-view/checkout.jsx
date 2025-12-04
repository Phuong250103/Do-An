import Address from "@/components/shopping-view/address";
import img from "../../assets/Banner3.jpg";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { createNewOrder } from "@/store/shop/order-slice";
import { useEffect } from "react";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const { cartItems, cartId } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { isLoading, payUrl } = useSelector((state) => state.shopOrder);

  // Redirect to MoMo when payUrl is ready
  useEffect(() => {
    if (payUrl) {
      window.location.href = payUrl;
    }
  }, [payUrl]);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiateMomo() {
    // Get the first address (or implement address selection)
    const addressInfo =
      addressList && addressList.length > 0 ? addressList[0] : null;

    if (!addressInfo) {
      alert("Vui lòng thêm địa chỉ giao hàng!");
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId,
      cartItems: cartItems?.items || [],
      addressInfo,
      totalAmount: totalCartAmount,
    };

    dispatch(createNewOrder(orderData));
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItems={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">
                {totalCartAmount.toLocaleString("vi-VN")} VND
              </span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button
              onClick={handleInitiateMomo}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Checkout with MOMO"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
