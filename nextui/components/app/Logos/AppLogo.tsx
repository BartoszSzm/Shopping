import { Avatar } from "@/components/ui/avatar";

const AppLogo = () => {
  return (
    <Avatar>
      <svg
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect x="0" y="0" width="256" height="256" fill="white" />
        <rect
          x="56"
          y="80"
          width="144"
          height="120"
          rx="12"
          fill="none"
          stroke="black"
          strokeWidth="10"
        />
        <path
          d="M88 80 C88 48, 168 48, 168 80"
          fill="none"
          stroke="black"
          strokeWidth="10"
        />
        <path
          d="M150 118
         C150 104, 106 104, 106 118
         C106 132, 150 132, 150 146
         C150 160, 106 160, 106 146"
          fill="none"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
    </Avatar>
  );
};

export default AppLogo;
