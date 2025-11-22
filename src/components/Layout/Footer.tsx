"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <>
      <div className="grow"></div>

      <footer className="bg-white dark:bg-[#1d1d1d] rounded-t-md px-[20px] md:px-[25px] py-[15px] md:py-[20px] text-center">
        <p>
          © <span className="text-purple-500">Trezo</span> is Proudly Owned by{" "}
          <a
            href="https://envytheme.com/"
            target="_blank"
            className="text-[#6A4CFF] transition-all hover:underline"
          >
            EnvyTheme
          </a>
        </p>
      </footer>
    </>
  );
};

export default Footer;
