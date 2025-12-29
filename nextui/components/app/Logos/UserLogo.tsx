import { Avatar } from "@/components/ui/avatar";

const UserLogo = () => {
  return (
    <Avatar>
      <svg className="w-full h-full" viewBox="0 0 256 256">
        <circle
          cx="128"
          cy="88"
          r="40"
          fill="none"
          stroke="black"
          strokeWidth="10"
        />
        <path
          d="M48 200 C48 152, 208 152, 208 200"
          fill="none"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
    </Avatar>
  );
};

export default UserLogo;
