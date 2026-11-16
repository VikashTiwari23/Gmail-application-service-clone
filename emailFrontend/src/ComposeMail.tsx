import { IconSend, IconX } from "@tabler/icons-react";
import  { useState } from "react";
import { NavLink } from "react-router-dom";
import { post } from "./api";

const ComposeMail = () => {
    const [error,setError] = useState('');

    const sendEmail = () => {
        post('/api/email/sendEmail',{to,subject,message})
            .then(res=>console.log(res))
            .catch(err=>setError(err.message))
    }

    const [to,setTo] = useState('');
    const [subject,setSubject]  = useState('');
    const [message,setMessage] = useState('');

  return (
    <>
    <div className="bg-black min-h-screen flex flex-col gap-4 w-full px-5 py-10">
      <h1 className="text-yellow-500 font-semibold text-5xl text-center pb-10">
        Write Your Mails
      </h1>
      <div className="bg-white px-14 py-4 mx-16 my-4 rounded-xl">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between cursor-pointer items-center">
            <div className="text-2xl font-semibold">New Message</div>
            <NavLink to={"/"} className="px-2 py-2 bg-gray-700 rounded-full">
              <IconX className="text-red-600" />
            </NavLink>
          </div>
          <div className="w-full border-2 border-black"></div>
          <div className="flex items-center gap-2 border-b border-gray-200 py-2 px-1 text-sm focus-within:border-blue-500 transition-colors">
            <label
              htmlFor="to-email"
              className="text-gray-500 font-medium select-none w-10"
            >
              To
            </label>

            <input
              id="to-email"
              type="email"
              placeholder="Recipients"
              onChange={(e)=>setTo(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm"
            />

            <div className="flex items-center gap-2 text-xs text-gray-500 select-none">
              <button
                type="button"
                className="hover:text-gray-800 hover:underline cursor-pointer"
              >
                Cc
              </button>
              <button
                type="button"
                className="hover:text-gray-800 hover:underline cursor-pointer"
              >
                Bcc
              </button>
            </div>
          </div>
          <div className="w-full border-1 border-black"></div>
          <div className="flex gap-5  items-center">
            <div>Subject : </div>
            <div className="w-2/3">
              <input
                type="text"
                placeholder="To inform about New Features of Gmail"
                onChange={(e)=>setSubject(e.target.value)}
                className="outline-none w-full  px-4 py-2"
              />
            </div>
          </div>
          <div className="w-full border-1 border-black"></div>
          <div className="flex gap-5">
            <div>Message</div>
            <textarea
             className="w-full outline px-1 py-1"
              name="message"
              onChange={(e)=>setMessage(e.target.value)}
              cols={5}
              placeholder="start writing ..."
            ></textarea>
          </div>
          <div className="flex justify-center mt-5">
            <button onClick={sendEmail} className="px-6 py-3 bg-red-600 flex gap-1 items-center rounded-2xl">
                <div>Send</div>
                <div><IconSend/></div>
            </button>
          </div>
        </div>
      </div>
    </div>
        {error.length>0 && <p className="text-xl text-red-600 text-center">Error : {error}</p>}
    </>
  );
};

export default ComposeMail;
