import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { getAllOrdersForAdmin, getUserById } from "@/store/admin/orders-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { ShoppingCart, Package, DollarSign, Clock } from "lucide-react";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { orderList } = useSelector((state) => state.adminOrders);
  const { productList } = useSelector((state) => state.adminProducts);
  const [userMap, setUserMap] = useState({});

  console.log(111, orderList);

  useEffect(() => {
    if (!orderList?.length) return;

    const uniqueUserIds = [
      ...new Set(orderList.map((o) => o.userId).filter(Boolean)),
    ];

    uniqueUserIds.forEach((id) => {
      if (!userMap[id]) {
        dispatch(getUserById(id)).then((res) => {
          setUserMap((prev) => ({
            ...prev,
            [id]: res.payload?.data?.userName,
          }));
        });
      }
    });
  }, [orderList, dispatch]);

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Monthly revenue for last 12 months (only delivered orders)
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNumber = m.getMonth() + 1;
      const yearShort = String(m.getFullYear()).slice(-2);
      months.push({
        key: `${m.getFullYear()}-${monthNumber}`,
        // use MM/YY format so labels are short and unambiguous (eg "3/25")
        label: `${monthNumber}/${yearShort}`,
        year: m.getFullYear(),
        month: monthNumber,
        value: 0,
      });
    }

    if (!orderList || !orderList.length) return months;

    orderList.forEach((order) => {
      if (order.orderStatus !== "delivered") return;
      const date = order.orderDate ? new Date(order.orderDate) : null;
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthObj = months.find((m) => m.key === key);
      if (monthObj) monthObj.value += Number(order.totalAmount || 0);
    });

    return months;
  }, [orderList]);

  // Calculate statistics
  const totalOrders = orderList?.length || 0;
  const totalProducts = productList?.length || 0;
  const totalRevenue =
    orderList
      ?.filter((order) => order.orderStatus === "delivered")
      ?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
  const pendingOrders =
    orderList?.filter((order) => order.orderStatus === "pending")?.length || 0;

  const stats = [
    {
      title: "Total orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total products",
      value: totalProducts,
      icon: Package,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total revenue",
      value: `${totalRevenue.toLocaleString("vi-VN")} VND`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Pending orders",
      value: pendingOrders,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Control panel</h1>
        <p className="text-gray-600 mt-2">Overview of store operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Monthly revenue (for the last 12 months)
            </h2>
            <div className="w-full overflow-x-auto">
              <div className="w-full" style={{ minWidth: 640 }}>
                {/* simple svg bar chart */}
                <svg
                  width="100%"
                  height={180}
                  viewBox="0 0 640 180"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g transform="translate(40,10)">
                    {/* y axis grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                      <line
                        key={i}
                        x1={0}
                        x2={560}
                        y1={t * 120}
                        y2={t * 120}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                    ))}

                    {/* left Y axis and value labels */}
                    {(() => {
                      const data = monthlyRevenue;
                      const max = Math.max(...data.map((d) => d.value), 1);
                      const GRID_H = 120;
                      return (
                        <>
                          <line
                            x1={0}
                            x2={0}
                            y1={0}
                            y2={GRID_H}
                            stroke="#cbd5e1"
                            strokeWidth={1.2}
                          />

                          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                            const y = t * GRID_H;
                            const val = Math.round((1 - t) * max);
                            return (
                              <text
                                key={`y-label-${i}`}
                                x={-8}
                                y={y + 4}
                                fontSize={10}
                                fill="#6b7280"
                                textAnchor="end"
                              >
                                {`${val.toLocaleString("vi-VN")} VND`}
                              </text>
                            );
                          })}
                        </>
                      );
                    })()}
                    {(() => {
                      const data = monthlyRevenue;
                      const max = Math.max(...data.map((d) => d.value), 1);
                      const barW = 560 / data.length;
                      const CHART_HEIGHT = 105;
                      const TOP_PADDING = 16;

                      const points = data.map((d, i) => {
                        const x = i * barW + 6;
                        const h = (d.value / max) * CHART_HEIGHT;
                        const y = CHART_HEIGHT - h + TOP_PADDING;
                        return `${x + (barW - 12) / 2},${y}`;
                      });

                      return (
                        <>
                          {/* trend line */}
                          <polyline
                            points={points.join(" ")}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth={2}
                          />

                          {/* points */}
                          {data.map((d, i) => {
                            const x = i * barW + 6;
                            const h = (d.value / max) * CHART_HEIGHT;
                            const y = CHART_HEIGHT - h + TOP_PADDING;

                            return (
                              <g key={d.key}>
                                <circle
                                  cx={x + (barW - 12) / 2}
                                  cy={y}
                                  r={3}
                                  fill="#6366f1"
                                />

                                {/* bar */}
                                <rect
                                  x={x}
                                  y={y}
                                  width={barW - 12}
                                  height={h}
                                  fill="rgba(99,102,241,0.9)"
                                  rx={4}
                                />

                                {/* value */}
                                <text
                                  x={x + (barW - 12) / 2}
                                  y={Math.max(y - 6, 10)}
                                  fontSize={10}
                                  fill="#374151"
                                  textAnchor="middle"
                                >
                                  {d.value > 0
                                    ? `${Math.round(d.value).toLocaleString(
                                        "vi-VN"
                                      )} VND`
                                    : ""}
                                </text>

                                {/* label */}
                                <text
                                  x={x + (barW - 12) / 2}
                                  y={140}
                                  fontSize={10}
                                  fill="#374151"
                                  textAnchor="middle"
                                >
                                  {d.label}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </g>
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Top users this month
            </h2>
            <div className="space-y-3">
              {(() => {
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                const userOrderCounts = {};
                const userDetails = {};

                orderList?.forEach((order) => {
                  if (order.orderStatus !== "delivered") return;
                  const orderDate = order.orderDate
                    ? new Date(order.orderDate)
                    : null;
                  if (!orderDate) return;

                  const orderMonth = orderDate.getMonth() + 1;
                  const orderYear = orderDate.getFullYear();

                  if (
                    orderMonth === currentMonth &&
                    orderYear === currentYear
                  ) {
                    const userId = order.userId;
                    userOrderCounts[userId] =
                      (userOrderCounts[userId] || 0) + 1;

                    if (!userDetails[userId]) {
                      userDetails[userId] = {
                        userId,
                        totalAmount: 0,
                        orderCount: 0,
                      };
                    }
                    userDetails[userId].totalAmount += Number(
                      order.totalAmount || 0
                    );
                    userDetails[userId].orderCount += 1;
                  }
                });

                const topUsers = Object.values(userDetails)
                  .sort((a, b) => b.orderCount - a.orderCount)
                  .slice(0, 3);

                return topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {userMap[user.userId] ||
                              `User ${user.userId.slice(-6)}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.orderCount} order
                            {user.orderCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {user.totalAmount.toLocaleString("vi-VN")} VND
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    No orders this month
                  </p>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent orders
          </h2>
          <div className="space-y-4">
            {orderList
              ?.slice()
              .reverse()
              .slice(0, 5)
              .map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between pb-4 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order._id?.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.orderDate?.split("T")[0]}
                    </p>

                    <div className="mt-1 space-y-0.5">
                      <p className="text-sm text-gray-500">
                        {order.cartItems
                          ?.map((item) =>
                            item.quantity > 1
                              ? `${item.title} x${item.quantity}`
                              : item.title
                          )
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {(order.totalAmount ?? 0).toLocaleString("vi-VN")} VND
                    </p>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.orderStatus === "confirmed" ||
                        order.orderStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.orderStatus === "confirmed"
                        ? "Confirmed"
                        : order.orderStatus === "delivered"
                        ? "Delivered"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              ))}

            {orderList?.length === 0 && (
              <p className="text-gray-500 text-center py-4">Chưa có đơn hàng</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
