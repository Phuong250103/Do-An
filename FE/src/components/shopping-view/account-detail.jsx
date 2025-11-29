import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePassword } from "../../store/auth-slice";
import { Button } from "../ui/button";

function AccountDetail() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) return <div>No account info found</div>;

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    dispatch(
      changePassword({
        userId: user._id,
        oldPassword,
        newPassword,
      })
    );
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">Account Detail</h2>

      <p>Name: {user?.userName}</p>
      <p>Email: {user?.email}</p>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold">Change Password</h3>

      <div className="flex flex-col space-y-2">
        <input
          type="password"
          placeholder="Old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="p-2 border rounded"
        />

        <Button onClick={handleChangePassword}>Update Password</Button>
      </div>
    </div>
  );
}

export default AccountDetail;
