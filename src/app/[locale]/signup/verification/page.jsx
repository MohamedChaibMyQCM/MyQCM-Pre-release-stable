import Image from 'next/image';
import logo from "../../../../../public/Icons/logo Myqcm 1.svg";
import Verification from "../../../../../public/Icons/verification.svg";


const page = () => {
  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-4">
      <div className='flex items-center justify-center mr-[60px]'>
        <Image src={logo} alt='logo' />
        <Image src={Verification} alt='verification' className='ml-[20px] mb-[12px]' />
      </div>
      <h3 className="text-[#141718] font-Inter font-semibold text-[19px]">
        Email Verification
      </h3>
      <p className="text-center font-Poppins text-[#B6ACB399] text-[14px] w-[420px] leading-[26px]">
        Dear Doctor [Import Full Name], <br /> Please check your email inbox
        (and spam folder) and click on the confirmation link to activate your
        MyQCM account.
      </p>
    </div>
  );
}

export default page