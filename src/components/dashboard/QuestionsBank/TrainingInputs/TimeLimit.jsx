const TimeLimit = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-full flex flex-col max-md:w-full mt-2">
      <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
        Définir une durée
      </span>
      <input
        type="number"
        required
        className="w-[100%] outline-none px-[20px] rounded-[24px] py-[10px] text-[15px] text-[#191919] placeholder:text-[#191919] font-medium border border-gray-300"
        placeholder="Durée limite (en secondes)"
        value={value}
        onChange={(e) => setFieldValue(name, e.target.value)}
      />
    </div>
  );
};

export default TimeLimit;
