import Dash_Header from '@/components/dashboard/Dash_Header';

const layout = ({children}) => {
  return (
    <div className="bg-background min-h-[calc(100vh-16px)]">
      <Dash_Header path={"/Question bank"} sub_path={""} />
      {children}
    </div>
  );
}

export default layout