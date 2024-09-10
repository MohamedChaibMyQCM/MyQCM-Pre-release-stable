import Image from "next/image";
import checkbox from "../../../../../public/Quiz/Checkbox (1).svg";

const NumberOfQuestion = ({ name, value, setFieldValue }) => {
  return (
    <div className="rounded-[14px] w-[320px] px-[12px] py-[8px] border border-[#EFEEFC] flex items-center gap-3">
      <Image src={checkbox} alt="checkbox" />
      <input
        type="number"
        required
        className="w-[100%] outline-none text-[14px] font-Poppins font-medium"
        placeholder="Enter a number"
        value={value}
        onChange={(e) => setFieldValue(name, e.target.value)}
      />
    </div>
  );
};

export default NumberOfQuestion;
