import Login from "@/components/app/auth/Login";
import { URLS } from "@/lib/apiClient";
import Link from "next/link";

const page = () => {
  return (
    <div>
      Welcome, go to app: <Link href={URLS.app.lists()}>GO</Link>
      <Login />
    </div>
  );
};

export default page;
