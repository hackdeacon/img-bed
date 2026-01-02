"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
// import { useRouter } from 'next/navigation'
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const router = useRouter()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      // console.log(result);
      if (result?.error) {
        console.log(result.error);
        toast.error("用户名或密码错误，请核对后在登陆！")
      } else {
        // 成功处理，比如重定向到一个受保护的页面
        // router.push("/admin")
        console.log('Login successful!');
        toast.success('登录成功，自动跳转到对应页面!')
        // toast.error('Login successful!')
        setTimeout(() => {
          window.location.reload(); // 延迟3秒后刷新页面
        }, 1000);
      }
    } catch (error) {
      console.log('Error during sign in:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-start items-center pt-20 px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h1>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6 font-sans" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300" htmlFor="username">Username</label>
              <div className="mt-2">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-800 placeholder:text-gray-400 placeholder:font-sans focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-gray-700 text-sm sm:text-sm leading-6 bg-white dark:bg-gray-900 font-sans"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300" htmlFor="password">Password</label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-800 placeholder:text-gray-400 placeholder:font-sans focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-gray-700 text-sm sm:text-sm leading-6 bg-white dark:bg-gray-900 font-sans"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 transition-colors"
            >Login</button>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right"/>
    </div>
  );
}
