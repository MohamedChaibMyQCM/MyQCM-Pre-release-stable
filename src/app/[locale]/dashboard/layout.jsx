import AuthWrapper from "@/components/auth/AuthWrapper";
import Aside from "@/components/dashboard/Aside";

const layout = ({ children }) => {
  return (
    <AuthWrapper>
      <main>
        <Aside />
        <div className="ml-60">{children}</div>
      </main>
    </AuthWrapper>
  );
};

export default layout;
