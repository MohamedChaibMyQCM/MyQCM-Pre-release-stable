import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logoMyqcm.svg";

const data = {
  footerLinks: [
    {
      title: "Sections",
      links: [
        { text: "Home", href: "#" },
        { text: "Features", href: "#" },
        { text: "Pricing", href: "#" },
        { text: "Contact", href: "#" },
      ],
    },
    {
      title: "Get to know us",
      links: [
        { text: "About us", href: "#" },
        { text: "Problem", href: "#" },
        { text: "Solution", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "FAQ", href: "#" },
        { text: "User guide", href: "#" },
      ],
    },
    {
      title: "Confidentiality",
      links: [
        { text: "Privacy policy", href: "#" },
        { text: "Terms and conditions", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        {
          text: "support.myqcm@myqcm.dz",
          href: "mailto:support.myqcm@myqcm.dz",
        },
        { text: "+213 677890976", href: "tel:+213677890976" },
        { text: "+213 578908832", href: "tel:+213578908832" },
      ],
    },
  ],
};

const Ready = () => {
  return (
    <section className="bg-[#FFF5FA] px-[100px] py-[60px]">
      <div className="flex flex-col justify-center items-center">
        <Image
          src={logo}
          alt="logo"
          width={340}
          height={100}
          className="w-[340px]"
        />
        <p className="text-[#191919] font-medium text-[15px] text-center mb-4 mt-10">
          Ready to enhance your medical knowledge and advance your career.
        </p>
        <Link
          href="/signup"
          className="rounded-[16px] text-white text-[14px] w-fit bg-gradient-to-r from-[#F8589F] via-[#FD2E8A] to-[#FD2E8A] py-[8px] px-[22px] hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          Start now
        </Link>
      </div>
      <ul className="flex justify-between mt-12">
        {data.footerLinks.map((category, index) => (
          <li key={index}>
            <h3 className="text-[#F8589F] mb-4 font-semibold text-[26px]">
              {category.title}
            </h3>
            <ul className="flex flex-col gap-3">
              {category.links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-[#191919] text-[15px] hover:text-[#F8589F] transition-colors duration-300"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Ready;
