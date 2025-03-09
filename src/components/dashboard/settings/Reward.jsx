import Image from 'next/image';
import profile_arrow from "../../../../public/settings/profile_arrow.svg"
import gift from "../../../../public/settings/gift.svg"
import vector from "../../../../public/settings/Vector.svg"

const Reward = () => {
  return (
    <div className="relative mx-5 mt-12 bg-[#FFFFFF] p-6 text-center rounded-[16px] overflow-hidden box">
      <h2 className="text-[#191919] text-[20px] font-[500]">
        You have <span className="text-[#F8589F]">800</span>XP
      </h2>
      <p className="my-4 text-[#191919] text-[14px] px-20">
        Discover all the incredible rewards you can unlock with your points!
        From exclusive discounts and limited-time offers to premium products and
        top-tier services, your points are your key to a world of exciting
        possibilities. Whether you&apos;re looking to save on your favorite
        items, enjoy VIP experiences, or access unique perks, there&apos;s
        something for everyone. Start exploring today and turn your points into
        unforgettable rewards. Don&apos;t wait—your next great adventure is just
        a few clicks away!
      </p>
      <button className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500]">
        See all rewards
      </button>
      <Image
        src={gift}
        alt="gift"
        className="absolute top-0 left-[24%] w-[90px]"
      />
      <Image
        src={profile_arrow}
        alt="profile arrow"
        className="absolute bottom-0 right-0"
      />
      <Image
        src={vector}
        alt="vector"
        className="absolute left-0 top-[50%] translate-y-[-50%]"
      />
    </div>
  );
}

export default Reward