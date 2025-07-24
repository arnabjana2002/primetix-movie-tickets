import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const LoadingComponent = () => {
  const { nextUrl } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate("/" + nextUrl);
      }, 8000);
    }
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full size-14 border-2 border-t-primary"></div>
    </div>
  );
};

export default LoadingComponent;
