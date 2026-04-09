import React from "react";
export const Logo: React.FC<{ className?: string; size?: number }> = ({
  className = "mr-2",
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {" "}
      <circle
        cx="16"
        cy="16"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-primary"
      />{" "}
      <circle
        cx="16"
        cy="16"
        r="3"
        fill="currentColor"
        className="text-primary"
      />{" "}
    </svg>
  );
};
export default Logo;
