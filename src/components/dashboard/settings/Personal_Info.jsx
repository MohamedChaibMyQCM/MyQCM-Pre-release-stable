import Image from "next/image";
import background_profile from "../../../../public/settings/background_profile.svg";

const Personal_Info = () => {
  return (
    <div className="mx-5">
      <div className="relative mt-8 bg-[#FFFFFF] h-[160px] rounded-[16px] overflow-hidden">
        <Image
          src={background_profile}
          alt="vector"
          className="absolute w-[100%]"
        />
        <div className="flex items-center gap-4 p-6">
          <Image src="" alt="profile img" />
          <div>
            <span className="text-[#191919]">Rayane Boucheraine</span>
            <span className="text-[#B5BEC6]">Premium + AI account</span>
          </div>
        </div>
      </div>
      <div className="my-8 bg-[#FFFFFF] p-6 rounded-[16px]">
        <div>
          <div>
            <h3>Personal information</h3>
            <p>
              Manage your personal information, update your contact details, to
              keep your profile up to date. Ensure your account settings reflect
              your latest information for a seamless experience.
            </p>
          </div>
          <button>Edit</button>
        </div>
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div className="bg-[#FFFFFF] p-6 rounded-[16px] ">
        <div>
          <div>
            <h3>Personal information</h3>
            <p>
              Manage your personal information, update your contact details, to
              keep your profile up to date. Ensure your account settings reflect
              your latest information for a seamless experience.
            </p>
          </div>
          <button>Edit</button>
        </div>
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    </div>
  );
};

export default Personal_Info;
