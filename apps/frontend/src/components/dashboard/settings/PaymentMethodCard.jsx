import Image from "next/image";


const PaymentMethodCard = ({ method, isSelected, onClick }) => {
  const { icon, title, description } = method;

  return (
    <div
      className={`flex-1 box rounded-[12px] px-4 py-5 border-[2px] max-md:w-full shadow-[0px_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)] ${
        isSelected ? "border-[#F8589F] bg-[#FFF5FA] dark:bg-pink-950/20" : "border-border"
      } cursor-pointer`}
      onClick={onClick}
    >
      <Image src={icon} alt={title} />
      <span className="text-card-foreground block text-[15px] font-[500] mt-2 mb-1">
        {title}
      </span>
      <span className="text-muted-foreground block text-[13px]">{description}</span>
    </div>
  );
};

export default PaymentMethodCard