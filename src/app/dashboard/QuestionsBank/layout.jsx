import QuestionsHead from '@/components/dashboard/QuestionsBank/QuestionsHead';

const layout = ({children}) => {
  return (
    <div className="border-l border-t border-[#E4E4E4] mt-[16px] min-h-[calc(100vh-16px)] rounded-tl-[18px]">
      <QuestionsHead />
      {children}
    </div>
  );
}

export default layout