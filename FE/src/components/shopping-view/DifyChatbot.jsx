import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ALLOWED_PATHS = ["/shop"];

export default function DifyChatbot() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const oldScript = document.getElementById("dify-embed");
    if (oldScript) {
      oldScript.remove();
    }
    if (!user) return;

    if (!ALLOWED_PATHS.some((p) => location.pathname.startsWith(p))) {
      return;
    }

    window.difyChatbotConfig = {
      token: "Xb35ONF8M6y5AJeS",
      dynamicScript: true,
      systemVariables: {
        user_id: user.id,
      },
      userVariables: {
        name: user.userName,
      },
    };

    const script = document.createElement("script");
    script.id = "dify-embed";
    script.src = "https://udify.app/embed.min.js";
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [user, location.pathname]);

  return null;
}
