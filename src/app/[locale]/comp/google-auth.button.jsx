import Image from "next/image";
import google from "../../../../public/Icons/google.svg";

const GoogleAuthButton = ({ locale }) => {
  const handleGoogleAuth = () => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/user/google/auth?locale=${locale}`;
    window.location.href = url;
  };

  return (
    <button
      onClick={handleGoogleAuth}
      className="flex items-center gap-5 justify-center w-full py-[10px] rounded-xl shadow-sm border transition duration-300"
    >
      <Image src={google} alt="google" />
      <span className=" whitespace-nowrap text-[15px] font-[600] text-black">
        Continue Avec Google
      </span>
    </button>
  );
};

export default GoogleAuthButton;
