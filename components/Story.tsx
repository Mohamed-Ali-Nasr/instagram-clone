import React, { FC } from "react";

const Story: FC<{ img: string; username: string }> = ({ img, username }) => {
  return (
    <div>
      <img
        src={img!}
        alt=""
        className="rounded-full w-14 h-14 p-[1.5px] border-red-500 border object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
      />
      <p className="text-xs text-center truncate w-14">{username}</p>
    </div>
  );
};

export default Story;
