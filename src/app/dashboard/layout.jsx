import Aside from "@/components/dashboard/Aside";

const layout = ({ children }) => {
  return (
      <main className="">
        <Aside />
        <div className="ml-[248px] max-md:ml-0 max-md:mt-[70px] h-[100vh] max-xl:ml-0">
          {children}
        </div>
      </main>
  );
};

export default layout;