import { useNavigate } from "react-router-dom";

export function handleBack() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();

  return () => {
    navigate(-1);
  };
}
