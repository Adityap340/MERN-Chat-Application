import React, { useContext, useEffect, useState } from 'react'
import { uniqBy } from 'lodash';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
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
    } else if ('text' in messageData){
      setMessages(prev => ([...prev, {sender:id, isOur: false, text: messageData.text }]));
    }
  }
  function sendMessage(e) {
    e.preventDefault();
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
    }));
    setNewMessageText('');
    setMessages(prev => ([...prev, { text: newMessageText, isOur: true }]));
  };

  const onlinePeopleExcOurUser = { ...onlinePeople };
  delete onlinePeopleExcOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, 'id')

  return (
    <div className='flex h-screen'>
      <div className='bg-white w-1/3  pt-4'>
        <Logo />
        {Object.keys(onlinePeopleExcOurUser).map(userId => (
          <div onClick={() => setSelectedUserId(userId)} className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${userId === selectedUserId ? 'bg-blue-200' : ''}`} key={userId}>
            {userId === selectedUserId && (
              <div className='w-1 h-14 bg-blue-500 rounded-r-md'></div>
            )}
            <div className='flex gap-2 py-2 pl-4 items-center'>
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className='text-gray-800'>{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}

      </div>
      <div className='flex flex-col bg-blue-300 w-2/3 p-2'>
        <div className='flex-grow'>
          {!selectedUserId && (
            <div className='flex items-center h-full justify-center'>
              <div className='text-gray-600'>&larr;Selecte a user</div>
            </div>
          )}
          {!!selectedUserId && (
            <div>
              {messagesWithoutDupes.map(message => (
                <div key={message.id}>
                  sender:{message.sender}<br />
                  my id: {id}<br />
                  {message.text}
                </div>
              ))}
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className='flex gap-2 ' onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={e => setNewMessageText(e.target.value)}
              type='text'
              placeholder='Type a message...'
              className='bg-white border p-2 flex-grow rounded-sm'
            />
            <button type='submit' className='bg-blue-500 p-2 text-white rounded-sm'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

export default Chat