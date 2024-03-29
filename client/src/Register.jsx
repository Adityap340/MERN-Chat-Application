import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'http://localhost:4000/register' : 'http://localhost:4000/login';
        const { data } = await axios.post(url, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    }
    return (
        <div className='bg-blue-300 h-screen flex items-center'>
            <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit}>
                <input
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text"
                    placeholder="Username"
                    className='block w-full rounded-md p-2 mb-2 border'
                />
                <input
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password"
                    placeholder="Password"
                    className='block w-full rounded-md p-2 mb-2 border'
                />
                <button className='bg-blue-500 text-white block w-full rounded-lg p-2'>{isLoginOrRegister === 'register' ? 'Register' : 'Login'}</button>
                <div className='text-center mt-2'>
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member?
                            <button onClick={() => setIsLoginOrRegister('login')}>
                                Login here
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Not a member?
                            <button onClick={() => setIsLoginOrRegister('register')}>
                                Register here
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

export default Register