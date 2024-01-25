import React, { useEffect, useState } from 'react'
import Avatar from './Avatar';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  useEffect(() => {
    const newWs = new WebSocket('ws://localhost:4000');
    setWs(newWs);
    newWs.addEventListener('message', handleMessage);
    return () => {
      newWs.removeEventListener('message', handleMessage);
    };

  }, []);
  function showOnLinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ('online' in messageData) {
      showOnLinePeople(messageData.online)
    }
  }
  return (
    <div className='flex h-screen'>
      <div className='bg-white w-1/3 pl-4 pt-4'>
        <div className='text-blue-500 font-bold flex gap-2 mb-4'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          MERN-CHATS
        </div>
        {Object.keys(onlinePeople).map(userId => (
          <div className='border-b border-gray-100 py-2 flex items-center gap-2 cursor-pointer' key={userId}>
            <Avatar username={onlinePeople[userId]} userId={userId} />
            <span className='text-gray-800'>{onlinePeople[userId]}</span>
          </div>
        ))}

      </div>
      <div className='flex flex-col bg-blue-300 w-2/3 p-2'>
        <div className='flex-grow'>
          Chat with selected person
        </div>
        <div className='flex gap-2 '>
          <input type='text' placeholder='Type a message...' className='bg-white border p-2 flex-grow rounded-sm' />
          <button className='bg-blue-500 p-2 text-white rounded-sm'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat