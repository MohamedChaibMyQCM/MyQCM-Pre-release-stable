import React from "react";

const ComingSoonPage = () => {
  return (
    <div className="bg-[#F7F8FA] h-screen px-[20px] py-[20px] flex items-center justify-center">
      <div className="relative max-w-2xl w-full bg-white rounded-2xl p-8 shadow-lg overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-0"></div>
        <div className="relative z-10 text-center">
          <div className="inline-block bg-[#FD2E8A]/10 p-4 rounded-full my-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#F8589F]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Exciting Feature Coming Soon!
          </h1>
          <p className="text-gray-600 mb-8">
            We&apos;re working hard to bring you an amazing new feature. Stay
            tuned for updates!
          </p>
          <div className="bg-[#F7F8FA] rounded-[16px] p-4 mb-8">
            <div className="h-4 bg-gradient-to-r from-[#FD2E8A] to-[#F8589F] rounded-full w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
