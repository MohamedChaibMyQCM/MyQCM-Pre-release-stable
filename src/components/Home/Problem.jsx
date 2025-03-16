import React from "react";
import Features from "./Features";

const Problem = () => {
  return (
    <section className="px-[100px] py-[60px]">
      <div>
        <h2 className="text-[#FD2E8A] text-[26px] font-[700] mb-4">Problem</h2>
        <div>
          <h4 className="text-[#191919] mb-1 text-[15px] font-[500]">
            Bridging the Gap Between Medical Knowledge and Real-World Healing
          </h4>
          <p className="text-[#666666] text-[14px]">
            The rapid growth of medical knowledge is overwhelming future
            doctors, making it <br /> harder for them to connect theory with
            real-world practice. As a result, many enter <br /> the field
            unprepared to apply their knowledge effectively, risking a gap
            between <br /> learning and true healing.
          </p>
        </div>
      </div>
      <div className="my-16">
        <h2 className="text-[#FD2E8A] text-[26px] font-[700] mb-2">Solution</h2>
        <ul>
          <li>
            <h4 className="text-[#F8589F]">Approach</h4>
            <p className="text-[14px] text-[#191919]">
              Filters overwhelming medical knowledge, delivering adaptive and
              practical learning tailored to real-world applications.
            </p>
          </li>
          <li>
            <h4 className="text-[#F8589F]">Technology</h4>
            <p className="text-[14px] text-[#191919]">
              Synergy AI powers MyQCM, providing an intelligent engine that
              streamlines medical education.
            </p>
          </li>
          <li>
            <h4 className="text-[#F8589F]">Outcome</h4>
            <p className="text-[14px] text-[#191919]">
              Future doctors graduate fully prepared to heal, equipped with both
              theoretical understanding and hands-on readiness.
            </p>
          </li>
        </ul>
      </div>
      <Features />
    </section>
  );
};

export default Problem;
