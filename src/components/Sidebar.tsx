import React from 'react';
import {
  Mic,
  Home,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  Check,
  Heart,
} from 'lucide-react';
import { ASSETS } from '../assets';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  className = '',
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'speaking', label: 'Phòng luyện nói', icon: Mic },
    { id: 'vocab', label: 'Từ vựng', icon: BookOpen },
    { id: 'grammar', label: 'Ngữ pháp', icon: FileText },
    { id: 'practice', label: 'Luyện tập', icon: MessageSquare },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <aside
      className={`w-[280px] bg-white border-r border-[#E8EEF8] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-sm shadow-[#3F6FF5]/30 shrink-0">
              <Mic className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-bold text-[19px] text-[#183B78] tracking-tight leading-tight">
                Cùng luyện nói
              </h1>
              <p className="text-[12px] text-[#6B83AD] font-medium mt-0.5">
                Nói tự tin · Tiến bộ mỗi ngày
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-4 py-2 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] transition-all text-left font-medium ${
                  isActive
                    ? 'bg-[#EAF1FF] text-[#3F6FF5] font-semibold shadow-xs'
                    : 'text-[#183B78] hover:bg-[#F8FBFF] hover:text-[#3F6FF5]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#3F6FF5] stroke-[2.4]' : 'text-[#6B83AD] stroke-[1.8]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Promotional Card at Bottom */}
      <div className="p-4 m-4 mt-auto rounded-2xl bg-gradient-to-b from-[#F2F7FF] to-[#FFFFFF] border border-[#DDE8F8] shadow-xs text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#3F6FF5]/10 rounded-full blur-xl pointer-events-none" />

        {/* Mascot / Avatar badge */}
        <div className="w-14 h-14 mx-auto mb-2 rounded-full overflow-hidden border-2 border-white shadow-xs p-0.5 bg-pink-50 flex items-center justify-center">
          <img
            src={ASSETS.promoTutor}
            alt="AI Tutor"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h3 className="font-bold text-[#183B78] text-[14px] leading-snug">
          Học nói tiếng Trung<br />cùng AI Tutor
        </h3>

        <div className="mt-3 space-y-1.5 text-left text-[11.5px] text-[#183B78]/90 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#3F6FF5]/10 text-[#3F6FF5] flex items-center justify-center shrink-0 text-[10px]">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Phản hồi tự nhiên như người thật</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#3F6FF5]/10 text-[#3F6FF5] flex items-center justify-center shrink-0 text-[10px]">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Sửa lỗi chính xác, nhẹ nhàng</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#3F6FF5]/10 text-[#3F6FF5] flex items-center justify-center shrink-0 text-[10px]">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Cá nhân hóa theo trình độ HSK</span>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-[#E8EEF8]/80 flex items-center justify-center gap-1 text-[12px] font-semibold text-[#3F6FF5]">
          <span>Cùng bạn chinh phục Tiếng Trung!</span>
          <Heart className="w-3.5 h-3.5 fill-[#3F6FF5] text-[#3F6FF5] shrink-0" />
        </div>
      </div>
    </aside>
  );
};
