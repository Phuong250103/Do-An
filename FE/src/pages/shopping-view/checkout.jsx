import Address from "@/components/shopping-view/address";
import img from "../../assets/Banner3.jpg";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { createNewOrder } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const { cartItems, cartId } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { isLoading, payUrl } = useSelector((state) => state.shopOrder);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Redirect to MoMo when payUrl is ready
  useEffect(() => {
    if (payUrl) {
      window.location.href = payUrl;
    }
  }, [payUrl]);

  const handleSelectProduct = (product, idx) => {
    const exists = selectedProducts.find((p) => p._idx === idx);

    if (exists) {
      setSelectedProducts(selectedProducts.filter((p) => p._idx !== idx));
    } else {
      // store index to uniquely identify this item in the list
      setSelectedProducts([...selectedProducts, { ...product, _idx: idx }]);
    }
  };

  const totalCartAmount =
    selectedProducts.length > 0
      ? selectedProducts.reduce(
          (sum, item) =>
            sum +
            (item?.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
          0
        )
      : 0;

  function handleInitiateMomo() {
    // Need at least one product selected and one address
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    if (!selectedProducts || selectedProducts.length === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán!");
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId,
      cartItems: selectedProducts,
      addressInfo: selectedAddress,
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
        <Address
          setCurrentSelectedAddress={setSelectedAddress}
          selectedId={selectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems?.items?.length > 0 &&
            cartItems.items.map((item, idx) => {
              const isSelected = selectedProducts.some((p) => p._idx === idx);
              return (
                <div
                  key={`${item.productId || "item"}-${idx}`}
                  className={`flex gap-2 items-center p-3 rounded transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-blue-500 bg-blue-50"
                      : "border border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectProduct(item, idx)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProduct(item, idx);
                    }}
                    readOnly
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <UserCartItemsContent cartItems={item} />
                  </div>
                </div>
              );
            })}

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
