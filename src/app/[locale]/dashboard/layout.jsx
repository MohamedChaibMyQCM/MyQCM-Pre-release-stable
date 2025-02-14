import AuthWrapper from "@/components/auth/AuthWrapper";
import Aside from "@/components/dashboard/Aside";

const layout = ({ children }) => {
  return (
    <AuthWrapper>
      <main className="">
        <Aside />
        <div className="ml-[248px] max-md:ml-0 max-md:mt-[70px] h-[100vh]">
          {children}
        </div>
      </main>
    </AuthWrapper>
  );
};

export default layout;