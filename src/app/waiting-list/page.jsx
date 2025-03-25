import wait_top from '../../../public/waitlist/wait-top.svg'
import wait_bottom from '../../../public/waitlist/wait-bottom.svg'
import wait_box from '../../../public/waitlist/wait-box.svg'
import twitter from '../../../public/waitlist/twitter.svg'
import linkedin from '../../../public/waitlist/linkedin.svg'
import insta from '../../../public/waitlist/insta.svg'
import tiktok from '../../../public/waitlist/tiktok.svg'
import Image from 'next/image';
import Link from 'next/link';

const page = () => {
  return (
    <div className="bg-[#F7F8FA] w-screen h-screen flex items-center justify-center">
      <div className="box bg-[#FFFFFF] rounded-[16px] p-6 w-[46%]">
        <Image src={wait_box} alt="wait box" className="w-full" />
        <div className="text-center">
          <h3 className="text-[#191919] font-[500] my-4 text-[20px]">
            Welcome to MyQCM Beta Waitlist!
          </h3>
          <p className="text-[13px] text-[#000000]">
            Thank you for signing up! You&apos;re now on the
            <span className="text-[#F8589F]"> MyQCM Beta Waitlist</span>, and
            we&apos;re excited to <br /> have you among the first to experience
            our platform. <br /> Our team is reviewing waitlist entries, and
            once your request is approved, you&apos;ll{" "}
            <span className="text-[#F8589F]">
              receive an <br /> email
            </span>{" "}
            with further details on how to access MyQCM Beta. We appreciate your
            patience as <br /> we ensure a smooth and valuable experience for
            our early users. <br /> Stay tuned we&apos;ll be in touch soon! In
            the meantime, feel free to reach out if you have any <br />{" "}
            questions. We can&apos;t wait for you to explore MyQCM!
          </p>
          <Link
            href="/"
            className="text-[#F8589F] font-[500] text-[15px] mb-3 mt-4 block"
          >
            Contact us
          </Link>
          <ul className="flex justify-center items-center gap-5">
            <li>
              <Image src={twitter} alt="twitter" className="w-[16px]" />
            </li>
            <li>
              <Image src={linkedin} alt="linkedin" className="w-[16px]" />
            </li>
            <li>
              <Image src={insta} alt="instagram" className="w-[16px]" />
            </li>
            <li>
              <Image src={tiktok} alt="tiktok" className="w-[16px]" />
            </li>
          </ul>
        </div>
      </div>
      <Image
        src={wait_top}
        alt="wait_top"
        className="w-[300px] absolute top-0 left-0"
      />
      <Image
        src={wait_bottom}
        alt="wait_bottom"
        className="w-[300px] absolute bottom-0 right-0"
      />
    </div>
  );
}

export default page