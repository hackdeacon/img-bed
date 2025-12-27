'use client'
import { signOut } from "next-auth/react"
import Table from "@/components/Table"
import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import Link from 'next/link'
import { faList, faFileAlt, faSearch, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';




export default function Admin() {
  const [listData, setListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0); // 初始化为0，因为初始时还没有搜索结果
  const [inputPage, setInputPage] = useState(1);
  const [view, setView] = useState('list'); // 'list' 或 'log'，默认为 'list'
  const [searchQuery, setSearchQuery] = useState('');



  const getListdata = useCallback(async (page) => {
    try {
      const res = await fetch(`/api/admin/${view}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          page: (page - 1),
          query: searchQuery, // 传递搜索查询
        })
      })
      const res_data = await res.json()
      if (!res_data?.success) {
        toast.error(res_data.message)
      } else {
        setListData(res_data.data)
        const totalPages = Math.ceil(res_data.total / 10);
        setSearchTotal(totalPages);
      }

    } catch (error) {
      toast.error(error.message)
    }

  })


  useEffect(() => {
    getListdata(currentPage)
  }, [currentPage, view]);

  // 分页控制按钮
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage > searchTotal) { // 检查下一页是否在总页数范围内
      toast.error('当前已为最后一页！')
    }
    if (nextPage <= searchTotal) { // 检查下一页是否在总页数范围内
      setCurrentPage(nextPage);
      setInputPage(nextPage)
    }

  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) { // 检查上一页是否在总页数范围内
      setCurrentPage(prevPage);
      setInputPage(prevPage)
      // searchVideo(prevPage);
    }

  };


  const handleJumpPage = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= searchTotal) {
      setCurrentPage(page);
    } else {
      toast.error('请输入有效的页码！');
    }
    // setInputPage(""); // 清空输入框
  };

  const handleViewToggle = () => {
    setView(view === 'list' ? 'log' : 'list');
    setCurrentPage(1); // 切换视图时重置到第一页
    setInputPage(1);
  };


  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setInputPage(1);
    getListdata(1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewToggle}
              className="px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={view === 'list' ? faFileAlt : faList} className="w-3.5 h-3.5" />
              {view === 'list' ? '日志页' : '数据页'}
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="搜索..."
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSearch} className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Link href="/">
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Table data={listData} />
      </div>

      {/* 分页 */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {currentPage} / {searchTotal}
          </span>
          <button
            onClick={handleNextPage}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            下一页
          </button>
          <div className="flex items-center gap-2 ml-3">
            <input
              type="number"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              className="text-sm px-2 py-1.5 border border-gray-200 rounded-lg w-16 text-center focus:outline-none focus:ring-2 focus:ring-gray-200"
              min="1"
            />
            <button
              onClick={handleJumpPage}
              className="px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              跳转
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </main>
  )
}