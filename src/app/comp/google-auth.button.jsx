import Image from "next/image";
import google from "../../../public/Icons/google.svg";

const GoogleAuthButton = () => {
  const handleGoogleAuth = () => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/user/google`;
    window.location.href = url;
  };

  return (
    <button
      onClick={handleGoogleAuth}
      className="flex items-center gap-5 justify-center w-full py-[10px] rounded-xl shadow-sm border transition duration-300 border-[#E4E4E4]"
    >
      <Image src={google} alt="google" />
      <span className="text-[15px] font-[500] text-[#191919]">
        Continue Avec Google
      </span>
    </button>
  );
};

export default GoogleAuthButton;
