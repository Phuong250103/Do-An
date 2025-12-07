import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

function MOMOReturnPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const resultCode = searchParams.get("resultCode");

    if (resultCode === "0") {
      setTimeout(() => {
        navigate("/shop/account");
      }, 5000);
    } else {
      const message = searchParams.get("message");

      setTimeout(() => {
        navigate("/shop/checkout");
      }, 3000);
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {searchParams.get("resultCode") === "0" ? (
          <div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              ✓ Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-4">Cảm ơn bạn đã mua hàng.</p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng đến trang đơn hàng...
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ✗ Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-4">
              {searchParams.get("message") || "Vui lòng thử lại"}
            </p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng lại trang thanh toán...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MOMOReturnPage;
