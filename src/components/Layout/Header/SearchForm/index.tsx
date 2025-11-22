"use client";

import React from "react";

const SearchForm: React.FC = () => {
  return (
    <>
      <form className="relative w-[250px] lg:w-[260px]">
        <input
          type="text"
          placeholder="Search here....."
          className="bg-white border border-gray-50 h-[44px] rounded-md w-full block text-[#1A1A1A] pt-[11px] pb-[12px] px-[13px] md:px-[16px] placeholder:text-[#8A8A8A] outline-0 dark:bg-[#21123da7] dark:text-white dark:border-[#21123da7] dark:placeholder:text-gray-400"
        />

        <button
          type="button"
          className="absolute text-purple-500 dark:text-purple-400 mt-[2px] ltr:right-[13px] ltr:md:right-[15px] rtl:left-[13px] rtl:md:left-[15px] top-1/2 -translate-y-1/2"
        >
          <i className="material-symbols-outlined !text-[20px]">search</i>
        </button>
      </form>
    </>
  );
};

export default SearchForm;
