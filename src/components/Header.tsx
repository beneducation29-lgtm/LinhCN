import React, { useState } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  Settings,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Award,
  BookMarked,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { HskLevel, getHskProfile } from '../data/hsk';

interface HeaderProps {
  onBack?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onToggleMobileSidebar?: () => void;
  onOpenHskModal?: () => void;
  onOpenLevelSelector?: () => void;
  hskLevel?: HskLevel;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  onOpenSettings,
  onOpenHelp,
  onToggleMobileSidebar,
  onOpenHskModal,
  onOpenLevelSelector,
  hskLevel = 'HSK 1',
  userName = 'Học viên',
  userEmail = '',
  onLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-[#E8EEF8] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-3.5">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-[#183B78] hover:bg-[#F0F6FF] rounded-xl transition-colors"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl hover:bg-[#F0F6FF] text-[#183B78] flex items-center justify-center transition-colors"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h2 className="font-bold text-[19px] text-[#183B78] tracking-tight">
          Phòng luyện nói
        </h2>

        {/* Dynamic HSK Level Selector Button */}
        <button
          onClick={onOpenLevelSelector || onOpenHskModal}
          className="bg-[#EAF1FF] hover:bg-[#dbe7ff] text-[#3F6FF5] text-[12px] font-bold px-3 py-1 rounded-full border border-[#DDE8F8] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-102"
          title="Bấm để đổi trình độ HSK 1–6"
        >
          <span>{hskLevel}</span>
          <span className="text-[10px] opacity-75">▾</span>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Help icon */}
        <button
          onClick={onOpenHelp}
          className="w-9 h-9 rounded-full border border-[#E8EEF8] text-[#6B83AD] hover:text-[#183B78] hover:bg-[#F8FBFF] flex items-center justify-center transition-colors"
          title="Trợ giúp & Hướng dẫn"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Settings icon */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full border border-[#E8EEF8] text-[#6B83AD] hover:text-[#183B78] hover:bg-[#F8FBFF] flex items-center justify-center transition-colors"
          title="Cài đặt"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-2xl hover:bg-[#F8FBFF] border border-transparent hover:border-[#E8EEF8] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DDE8F8] bg-slate-100 shrink-0 shadow-xs">
              <img
                src={ASSETS.studentTriet}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-[13.5px] text-[#183B78] leading-tight">
                Nguyễn Minh Triết
              </div>
              <div className="text-[11.5px] text-[#6B83AD] font-medium leading-tight">
                {hskLevel}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B83AD] shrink-0" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8EEF8] py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-[#F0F6FF]">
                <p className="font-semibold text-[13px] text-[#183B78]">
                  Nguyễn Minh Triết
                </p>
                <p className="text-[11px] text-[#6B83AD]">
                  {userEmail}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#183B78] hover:bg-[#F0F6FF] flex items-center gap-2.5"
                >
                  <User className="w-4 h-4 text-[#6B83AD]" />
                  <span>Hồ sơ học tập</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#183B78] hover:bg-[#F0F6FF] flex items-center gap-2.5"
                >
                  <Award className="w-4 h-4 text-[#6B83AD]" />
                  <span>Cấp độ {hskLevel} · {getHskProfile(hskLevel).wordCount} từ</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#183B78] hover:bg-[#F0F6FF] flex items-center gap-2.5"
                >
                  <BookMarked className="w-4 h-4 text-[#6B83AD]" />
                  <span>Sổ tay từ vựng đã lưu</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#F0F6FF]">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout?.();
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#F04444] hover:bg-red-50 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
