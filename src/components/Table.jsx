import { useState, useEffect } from "react";
import Switcher from '@/components/SwitchButton';
import { toast } from "react-toastify";
import React, { useRef } from 'react';
import TooltipItem from '@/components/Tooltip';
import FullScreenIcon from "@/components/FullScreenIcon"
import { PhotoProvider, PhotoView } from 'react-photo-view';

export default function Table({ data: initialData = [] }) {

    const [data, setData] = useState(initialData); // 初始化状态
    const [modalData, setModalData] = useState(null);
    const modalRef = useRef(null);



    useEffect(() => {
        setData(initialData); // 更新数据
    }, [initialData]);

    const handleClickOutside = (e) => {
        console.log(modalRef.current.contains(e.target));
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setModalData(null);
        }
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : '';




    const getImgUrl = (url) => {
        return url.startsWith("/file/") || url.startsWith("/cfile/") || url.startsWith("/rfile/") ? `${origin}/api${url}` : url;
    };

    const handleNameClick = (item) => {
        setModalData(item);
    };

    const handleCloseModal = () => {
        setModalData(null);
    };



    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`链接复制成功`);
        });
    };



    const deleteItem = async (initName) => {
        try {
            const res = await fetch(`/api/admin/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: initName,
                }),
            });
            const res_data = await res.json();
            if (res_data.success) {
                toast.success('删除成功!');
                setData(prevData => prevData.filter(item => item.url !== initName));
            } else {
                toast.error(res_data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    const handleDelete = async (initName) => {
        const confirmed = window.confirm('你确定要删除这个项目吗？');
        if (confirmed) {
            await deleteItem(initName);
        }
    };


    function getLastSegment(url) {
        const lastSlashIndex = url.lastIndexOf('/');
        return url.substring(lastSlashIndex + 1);
    }
    const renderFile = (fileUrl, index) => {
        const _url = getLastSegment(fileUrl);
        const getFileExtension = (url) => {
            const parts = url.split('.');
            return parts.length > 1 ? parts.pop().toLowerCase() : '';
        };
        const fileExtension = getFileExtension(_url);



        const imageExtensions = [
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp',
            'svg', 'ico', 'heic', 'heif', 'raw', 'psd', 'ai', 'eps'
        ];

        const videoExtensions = [
            'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'ogg',
            'ogv', 'm4v', '3gp', '3g2', 'mpg', 'mpeg', 'mxf', 'vob'
        ];

        if (imageExtensions.includes(fileExtension)) {

            return (
                <img
                    key={`image-${index}`}
                    src={fileUrl}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover"
                />
            );
        }
        else if (videoExtensions.includes(fileExtension)) {
            return (
                <video
                    key={`video-${index}`}
                    src={fileUrl}
                    className="w-full h-full object-cover"
                    controls
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
        else {
            return (
                <img
                    key={`image-${index}`}
                    src={fileUrl}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover"
                />
            );
        }
    };

    function toggleFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            const element = document.querySelector('.PhotoView-Portal');
            if (element) {
                element.requestFullscreen();
            }
        }
    }

    // const isImage = (url) => {
    //     return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    // };

    const isVideo = (url) => {
        return /\.(mp4|mkv|avi|mov|wmv|flv|webm|ogg|ogv|m4v|3gp|3g2|mpg|mpeg|mxf|vob)$/i.test(url);
    }

    const elementSize = 400;
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                        <tr>
                            <th className="py-2.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                            <th className="py-2.5 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">预览</th>
                            <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                            <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">来源</th>
                            <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                            <th className="py-2.5 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <PhotoProvider
                            maskOpacity={0.6}
                            toolbarRender={({ rotate, onRotate, onScale, scale }) => {
                                return (
                                    <>
                                        <svg
                                            className="PhotoView-Slider__toolbarIcon"
                                            width="44"
                                            height="44"
                                            viewBox="0 0 768 768"
                                            fill="white"
                                            onClick={() => onScale(scale + 0.5)}
                                        >
                                            <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM415.5 223.5v129h129v63h-129v129h-63v-129h-129v-63h129v-129h63z" />
                                        </svg>
                                        <svg
                                            className="PhotoView-Slider__toolbarIcon"
                                            width="44"
                                            height="44"
                                            viewBox="0 0 768 768"
                                            fill="white"
                                            onClick={() => onScale(scale - 0.5)}
                                        >
                                            <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM223.5 352.5h321v63h-321v-63z" />
                                        </svg>
                                        <svg
                                            className="PhotoView-Slider__toolbarIcon"
                                            onClick={() => onRotate(rotate + 90)}
                                            width="44"
                                            height="44"
                                            fill="white"
                                            viewBox="0 0 768 768"
                                        >
                                            <path d="M565.5 202.5l75-75v225h-225l103.5-103.5c-34.5-34.5-82.5-57-135-57-106.5 0-192 85.5-192 192s85.5 192 192 192c84 0 156-52.5 181.5-127.5h66c-28.5 111-127.5 192-247.5 192-141 0-255-115.5-255-256.5s114-256.5 255-256.5c70.5 0 135 28.5 181.5 75z" />
                                        </svg>
                                        {document.fullscreenEnabled && <FullScreenIcon onClick={toggleFullScreen} />}
                                    </>
                                );
                            }}>
                            {data.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td onClick={() => handleNameClick(item)} className="py-2.5 px-4 text-sm text-gray-700 truncate max-w-56 cursor-pointer hover:text-gray-900 font-mono">
                                        {item.url}
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="w-14 h-14 mx-auto rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                                            {isVideo(getImgUrl(item.url)) ? (
                                                <PhotoView key={item.url}
                                                    width={elementSize}
                                                    height={elementSize}
                                                    render={({ scale, attrs }) => {
                                                        const width = attrs.style.width;
                                                        const offset = (width - elementSize) / elementSize;
                                                        const childScale = scale === 1 ? scale + offset : 1 + offset;
                                                        return (
                                                            <div {...attrs} className={`flex-none bg-white ${attrs.className || ''}`}>
                                                                {renderFile(getImgUrl(item.url), index)}
                                                            </div>
                                                        )
                                                    }}
                                                >
                                                    {renderFile(getImgUrl(item.url), index)}
                                                </PhotoView>
                                            ) : (
                                                <PhotoView key={item.url} src={getImgUrl(item.url)}>
                                                    {renderFile(getImgUrl(item.url), index)}
                                                </PhotoView>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-sm text-gray-600 max-w-48">{item.time}</td>
                                    <td className="py-2.5 px-4 text-sm text-gray-600 max-w-48 truncate">
                                        <TooltipItem tooltipsText={item.referer} position="bottom">{item.referer}</TooltipItem>
                                    </td>
                                    <td className="py-2.5 px-4 text-sm text-gray-600 max-w-48 truncate font-mono">
                                        <TooltipItem tooltipsText={item.ip} position="bottom">{item.ip}</TooltipItem>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Switcher initialChecked={item.rating} initName={item.url} />
                                            <button
                                                onClick={() => handleDelete(item.url)}
                                                className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </PhotoProvider>
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>暂无数据</p>
                </div>
            )}

            {modalData && (
                <div onClick={handleClickOutside} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">复制链接</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { label: 'URL', text: getImgUrl(modalData.url) },
                                { label: 'Markdown', text: `![${modalData.url}](${getImgUrl(modalData.url)})` },
                                { label: 'HTML', text: `<img src="${getImgUrl(modalData.url)}" />` },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 w-16 flex-shrink-0">{item.label}</span>
                                    <input
                                        readOnly
                                        value={item.text}
                                        onClick={() => handleCopy(item.text)}
                                        className="flex-1 text-xs px-2 py-1.5 bg-gray-50 border border-gray-100 rounded text-gray-600 focus:outline-none cursor-pointer truncate"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
