import React from 'react'

const Avatar = ({userId,username}) => {
    const colors = ["bg-indigo-200", "bg-slate-400", "bg-red-200", "bg-green-200", "bg-blue-200", "bg-yellow-200", "bg-purple-200", "bg-pink-200", "bg-gray-200", "bg-orange-200", "bg-teal-200"];
    const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
  return (
    <div className={`w-10 h-10 rounded-full flex items-center ${color}`}>
        <div className='text-center w-full opacity-70'>{username[0]}</div>
    </div>
  )
}

export default Avatar