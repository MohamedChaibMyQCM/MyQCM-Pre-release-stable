import Image from "next/image";


const PaymentMethodCard = ({ method, isSelected, onClick }) => {
  const { icon, title, description } = method;

  return (
    <div
      className={`flex-1 box rounded-[12px] px-4 py-5 border-[2px] max-md:w-full ${
        isSelected ? "border-[#F8589F] bg-[#FFF5FA]" : "border-transparent"
      } cursor-pointer`}
      onClick={onClick}
    >
      <Image src={icon} alt={title} />
      <span className="text-[#191919] block text-[15px] font-[500] mt-2 mb-1">
        {title}
      </span>
      <span className="text-[#4F4D55] block text-[13px]">{description}</span>
    </div>
  );
};

export default PaymentMethodCard