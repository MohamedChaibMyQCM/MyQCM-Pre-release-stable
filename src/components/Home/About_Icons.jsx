const About_Icons = () => {
  return (
    <div className=" grid grid-cols-4 gap-4 p-4 rotate-[]">
      <ul className="contents">
        {Array.from({ length: 16 }).map((_, index) => (
          <li
            key={index}
            className="bg-[#FFFFFF] flex items-center justify-center rounded-[20px] w-[140px] h-[80px] shape"
          >
            {index}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default About_Icons;
