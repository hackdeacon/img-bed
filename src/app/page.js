"use client";
import { useState, useRef, useCallback } from "react";
import { signOut } from "next-auth/react"
import Image from "next/image";
import { faImages, faTrashAlt, faUpload, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useEffect } from 'react';
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";


const LoginButton = ({ onClick, href, children }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
  >
    {children}
  </button>
);


export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFilesNum, setUploadedFilesNum] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null); // 添加状态用于跟踪选中的放大图片
  const [activeTab, setActiveTab] = useState('preview');
  const [uploading, setUploading] = useState(false);
  const [IP, setIP] = useState('');
  const [Total, setTotal] = useState('?');
  const [selectedOption, setSelectedOption] = useState('r2'); // 初始选择 Cloudflare
  const [isAuthapi, setisAuthapi] = useState(false); // 初始选择第一个选项
  const [Loginuser, setLoginuser] = useState(''); // 初始选择第一个选项
  const [boxType, setBoxtype] = useState("img");

  const origin = typeof window !== 'undefined' ? window.location.origin : '';


  const parentRef = useRef(null);
  const fileInputRef = useRef(null);






  let headers = {

    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",

  }
  useEffect(() => {
    ip();
    getTotal();
    isAuth();


  }, []);
  const ip = async () => {
    try {

      const res = await fetch(`/api/ip`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });
      const data = await res.json();
      setIP(data.ip);



    } catch (error) {
      console.error('请求出错:', error);
    }
  };
  const isAuth = async () => {
    try {

      const res = await fetch(`/api/enableauthapi/isauth`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });

      if (res.ok) {
        const data = await res.json();
        setisAuthapi(true)
        setLoginuser(data.role)

      } else {
        setisAuthapi(false)
      }



    } catch (error) {
      console.error('请求出错:', error);
    }
  };

  const getTotal = async () => {
    try {

      const res = await fetch(`/api/total`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });
      const data = await res.json();
      setTotal(data.total);



    } catch (error) {
      console.error('请求出错:', error);
    }
  }

  const handleFileChange = (event) => {
    if (!isAuthapi) {
      toast.error('请先登录后再选择文件');
      return;
    }
    const newFiles = event.target.files;
    const filteredFiles = Array.from(newFiles).filter(file =>
      !selectedFiles.find(selFile => selFile.name === file.name));
    // 过滤掉已经在 uploadedImages 数组中存在的文件
    const uniqueFiles = filteredFiles.filter(file =>
      !uploadedImages.find(upImg => upImg.name === file.name)
    );

    setSelectedFiles([...selectedFiles, ...uniqueFiles]);

    // 清空 input value，允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setUploadStatus('');
    // setUploadedImages([]);
  };

  const getTotalSizeInMB = (files) => {
    const totalSizeInBytes = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    return (totalSizeInBytes / (1024 * 1024)).toFixed(2); // 转换为MB并保留两位小数
  };



  const handleUpload = async (file = null) => {
    // Check authentication before upload
    if (!isAuthapi) {
      toast.error('请先登录后再上传图片');
      return;
    }

    setUploading(true);

    const filesToUpload = file ? [file] : selectedFiles;

    if (filesToUpload.length === 0) {
      toast.error('请选择要上传的文件');
      setUploading(false);
      return;
    }

    const formFieldName = selectedOption === "tencent" ? "media" : "file";
    let successCount = 0;

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();

        formData.append(formFieldName, file);

        try {
          const targetUrl = selectedOption === "tgchannel" || selectedOption === "r2"
            ? `/api/enableauthapi/${selectedOption}`
            : `/api/${selectedOption}`;

          // const response = await fetch("https://img.131213.xyz/api/tencent", {
          const response = await fetch(targetUrl, {
            method: 'POST',
            body: formData,
            headers: headers
          });

          if (response.ok) {
            const result = await response.json();
            // console.log(result);

            file.url = result.url;

            // 更新 uploadedImages 和 selectedFiles
            setUploadedImages((prevImages) => [...prevImages, file]);
            setSelectedFiles((prevFiles) => prevFiles.filter(f => f !== file));
            successCount++;
          } else {
            // 尝试从响应中提取错误信息
            let errorMsg;
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || `上传 ${file.name} 图片时出错`;
            } catch (jsonError) {
              // 如果解析 JSON 失败，使用默认错误信息
              errorMsg = `上传 ${file.name} 图片时发生未知错误`;
            }

            // 细化状态码处理
            switch (response.status) {
              case 400:
                toast.error(`请求无效: ${errorMsg}`);
                break;
              case 403:
                toast.error(`无权限访问资源: ${errorMsg}`);
                break;
              case 404:
                toast.error(`资源未找到: ${errorMsg}`);
                break;
              case 500:
                toast.error(`服务器错误: ${errorMsg}`);
                break;
              case 401:
                toast.error(`未授权: ${errorMsg}`);
                break;
              default:
                toast.error(`上传 ${file.name} 图片时出错: ${errorMsg}`);
            }
          }
        } catch (error) {
          toast.error(`上传 ${file.name} 图片时出错`);
        }
      }

      setUploadedFilesNum(uploadedFilesNum + successCount);
      toast.success(`已成功上传 ${successCount} 张图片`);

    } catch (error) {
      console.error('上传过程中出现错误:', error);
      toast.error('上传错误');
    } finally {
      setUploading(false);
    }
  };





  const handlePaste = (event) => {
    const clipboardItems = event.clipboardData.items;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.kind === 'file' && item.type.includes('image')) {
        const file = item.getAsFile();
        setSelectedFiles([...selectedFiles, file]);
        break; // 只处理第一个文件
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const filteredFiles = Array.from(files).filter(file => !selectedFiles.find(selFile => selFile.name === file.name));
      setSelectedFiles([...selectedFiles, ...filteredFiles]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // 根据图片数量动态计算容器高度
  const calculateMinHeight = () => {
    const rows = Math.ceil(selectedFiles.length / 4);
    return `${rows * 100}px`;
  };

  // 处理点击图片放大
  const handleImageClick = (index) => {

    if (selectedFiles[index].type.startsWith('image/')) {
      setBoxtype("img");
    } else if (selectedFiles[index].type.startsWith('video/')) {
      setBoxtype("video");
    } else {
      setBoxtype("other");
    }

    setSelectedImage(URL.createObjectURL(selectedFiles[index]));
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // alert('已成功复制到剪贴板');
      toast.success(`链接复制成功`);
    } catch (err) {
      toast.error("链接复制失败")
    }
  };

  const handleCopyCode = async () => {
    const codeElements = parentRef.current.querySelectorAll('code');
    const values = Array.from(codeElements).map(code => code.textContent);
    try {
      await navigator.clipboard.writeText(values.join("\n"));
      toast.success(`链接复制成功`);

    } catch (error) {
      toast.error(`链接复制失败\n${error}`)
    }
  }

  const handlerenderImageClick = (imageUrl, type) => {
    setBoxtype(type);
    setSelectedImage(imageUrl);
  };


  const renderFile = (data, index) => {
    const fileUrl = data.url;
    if (data.type.startsWith('image/')) {
      return (
        <img
          key={`image-${index}`}
          src={data.url}
          alt={`Uploaded ${index}`}
          className="object-cover w-36 h-40 m-2"
          onClick={() => handlerenderImageClick(fileUrl, "img")}
        />
      );

    } else if (data.type.startsWith('video/')) {
      return (
        <video
          key={`video-${index}`}
          src={data.url}
          className="object-cover w-36 h-40 m-2"
          controls
          onClick={() => handlerenderImageClick(fileUrl, "video")}
        >
          Your browser does not support the video tag.
        </video>
      );

    } else {
      // 其他文件类型
      return (
        <img
          key={`image-${index}`}
          src={data.url}
          alt={`Uploaded ${index}`}
          className="object-cover w-36 h-40 m-2"
          onClick={() => handlerenderImageClick(fileUrl, "other")}
        />
      );
    }



  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <div className=" flex flex-col ">
            {uploadedImages.map((data, index) => (
              <div key={index} className="m-2 rounded-2xl ring-offset-2 ring-2  ring-slate-100 flex flex-row ">
                {renderFile(data, index)}
                <div className="flex flex-col justify-center w-4/5">
                  {[
                    { text: data.url, onClick: () => handleCopy(data.url) },
                    { text: `![${data.name}](${data.url})`, onClick: () => handleCopy(`![${data.name}](${data.url})`) },
                    { text: `<a href="${data.url}" target="_blank"><img src="${data.url}"></a>`, onClick: () => handleCopy(`<a href="${data.url}" target="_blank"><img src="${data.url}"></a>`) },
                    { text: `[img]${data.url}[/img]`, onClick: () => handleCopy(`[img]${data.url}[/img]`) },
                  ].map((item, i) => (
                    <input
                      key={`input-${i}`}
                      readOnly
                      value={item.text}
                      onClick={item.onClick}
                      className="px-3 my-1 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                    />
                  ))}
                </div>
              </div>

            ))}
          </div>
        );
      case 'htmlLinks':
        return (
          <div ref={parentRef} className=" p-4 bg-slate-100  " onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2 ">
                <code className=" w-2 break-all">{`<img src="${data.url}" alt="${data.name}" />`}</code>
              </div>
            ))}
          </div >
        );
      case 'markdownLinks':
        return (
          <div ref={parentRef} className=" p-4 bg-slate-100  " onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2">
                <code className=" w-2 break-all">{`![${data.name}](${data.url})`}</code>
              </div>
            ))}
          </div>
        );
      case 'bbcodeLinks':
        return (
          <div ref={parentRef} className=" p-4 bg-slate-100  " onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2">
                <code className=" w-2 break-all">{`[img]${data.url}[/img]`}</code>
              </div>
            ))}
          </div>
        );
      case 'viewLinks':
        return (
          <div ref={parentRef} className=" p-4 bg-slate-100  " onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2">
                <code className=" w-2 break-all">{`${data.url}`}</code>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value); // 更新选择框的值
  };


  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const renderButton = () => {
    if (!isAuthapi) {
      return (
        <Link href="/login">
          <LoginButton>登录</LoginButton>
        </Link>
      );
    }
    switch (Loginuser) {
      case 'user':
        return <LoginButton onClick={handleSignOut}>登出</LoginButton>;
      case 'admin':
        return (
          <Link href="/admin">
            <LoginButton>管理</LoginButton>
          </Link>
        );
      default:
        return (
          <Link href="/login">
            <LoginButton>登录</LoginButton>
          </Link>
        );
    }
  };


  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://pic.hackdeacon.cn/hack.png" alt="Logo" className="w-7 h-7" />
            <span className="text-base font-medium text-gray-900 dark:text-white tracking-tight">黑影胶片</span>
          </div>
          {renderButton()}
        </div>
      </header>

      {/* 主要内容 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 上传接口选择 */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-base font-medium text-gray-900 dark:text-white">图片或视频上传</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              上传最大 5 MB · 已托管 <span className="text-gray-700 dark:text-gray-300">{Total}</span> 张
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {[
              { value: 'r2', label: 'Cloudflare' },
              { value: 'tgchannel', label: 'Telegram' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedOption(option.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedOption === option.value
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 拖拽上传区域 */}
        <div
          className="relative bg-white dark:bg-black rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors min-h-[160px] sm:min-h-[200px]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaste={handlePaste}
        >
          <div className="flex flex-wrap gap-3 sm:gap-4 p-3 sm:p-4">
            <LoadingOverlay loading={uploading} />
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div
                  className="w-28 h-28 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  {file.type.startsWith('image/') && (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${file.name}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  {file.type.startsWith('video/') && (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-2 text-center">
                      {file.name}
                    </div>
                  )}
                </div>
                {/* 悬浮操作按钮 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5">
                  <button
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-700"
                    onClick={(e) => { e.stopPropagation(); handleImageClick(index); }}
                  >
                    <FontAwesomeIcon icon={faSearchPlus} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-red-500"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-green-500"
                    onClick={(e) => { e.stopPropagation(); handleUpload(file); }}
                  >
                    <FontAwesomeIcon icon={faUpload} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {selectedFiles.length === 0 && (
              <div className="w-full flex items-center justify-center h-[104px] sm:h-[136px]">
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs sm:text-sm">拖拽或粘贴上传</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作栏 */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4">
          <label
            htmlFor="file-upload"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs sm:text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            <FontAwesomeIcon icon={faImages} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            选择图片
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {selectedFiles.length} 张 ({getTotalSizeInMB(selectedFiles)} MB)
          </span>
          <div className="flex-1"></div>
          <button
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={handleClear}
          >
            清除
          </button>
          <button
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors ${
              uploading
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleUpload()}
            disabled={uploading}
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </div>

        <ToastContainer position="bottom-right" />

        {/* 已上传图片区域 */}
        {uploadedImages.length > 0 && (
          <div className="mt-6 sm:mt-8">
            {/* Tab 切换 */}
            <div className="flex gap-1 sm:gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { key: 'preview', label: '预览' },
                { key: 'htmlLinks', label: 'HTML' },
                { key: 'markdownLinks', label: 'Markdown' },
                { key: 'bbcodeLinks', label: 'BBCode' },
                { key: 'viewLinks', label: '链接' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-gray-900 dark:text-white border-gray-900 dark:border-gray-100'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 预览模式 */}
            {activeTab === 'preview' && (
              <div className="space-y-3 sm:space-y-4">
                {uploadedImages.map((data, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800">
                    <div
                      className="w-full sm:w-24 sm:h-24 aspect-square sm:aspect-auto flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                      onClick={() => handlerenderImageClick(data.url, data.type.startsWith('video/') ? 'video' : 'img')}
                    >
                      {data.type.startsWith('image/') ? (
                        <img src={data.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <video src={data.url} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      {[
                        { label: 'URL', value: data.url },
                        { label: 'Markdown', value: `![${data.name}](${data.url})` },
                        { label: 'HTML', value: `<img src="${data.url}" />` },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500 w-12 sm:w-16 flex-shrink-0">{item.label}</span>
                          <input
                            readOnly
                            value={item.value}
                            onClick={() => handleCopy(item.value)}
                            className="flex-1 text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 cursor-pointer truncate"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 其他模式 */}
            {activeTab !== 'preview' && (
              <div
                ref={parentRef}
                className="p-4 bg-white dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 cursor-pointer"
                onClick={handleCopyCode}
              >
                {uploadedImages.map((data, index) => {
                  const formats = {
                    htmlLinks: `<img src="${data.url}" alt="${data.name}" />`,
                    markdownLinks: `![${data.name}](${data.url})`,
                    bbcodeLinks: `[img]${data.url}[/img]`,
                    viewLinks: data.url,
                  };
                  return (
                    <code key={index} className="block text-xs text-gray-600 dark:text-gray-300 break-all">
                      {formats[activeTab]}
                    </code>
                  );
                })}
                <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 text-center">点击复制全部</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 图片预览弹窗 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleCloseImage}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={handleCloseImage}
          >
            &times;
          </button>
          {boxType === 'img' && (
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
          )}
          {boxType === 'video' && (
            <video
              src={selectedImage}
              className="max-w-full max-h-[90vh] rounded-lg"
              controls
              autoPlay
            />
          )}
        </div>
      )}

    </main>
  );
}