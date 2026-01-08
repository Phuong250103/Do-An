import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePassword } from "../../store/auth-slice";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function AccountDetail() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return <div>No account info found</div>;

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    dispatch(changePassword({ userId: user._id, oldPassword, newPassword }))
      .unwrap()
      .then((res) => {
        toast({
          title: "Success",
          description: res.message,
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">Account Detail</h2>

      <p>Name: {user?.userName}</p>
      <p>Email: {user?.email}</p>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold">Change Password</h3>

      <div className="flex flex-col space-y-2">
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            placeholder="Old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="p-2 border rounded w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowOld((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showOld ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="p-2 border rounded w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-2 border rounded w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <Button onClick={handleChangePassword}>Update Password</Button>
      </div>
    </div>
  );
}

export default AccountDetail;
