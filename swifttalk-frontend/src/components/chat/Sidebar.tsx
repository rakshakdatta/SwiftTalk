'use client';

import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import ProfileDetails from '@/components/shared/ProfileDetails';
import ProfileImageModal from '@/components/shared/ProfileImageModal';
import ImageCropModal from '@/components/shared/ImageCropModal';
import axios from '@/lib/axios';
import { User } from '@/types/chat';

interface Props {
  currentUser: User | null;
  users: User[];
  selectedUser: User | null;
  onSelect: (user: User) => void;
  imageMap: Record<string, string>;
}

interface FullProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  hasProfileImage: boolean;
}

export default function Sidebar({
  currentUser,
  users,
  selectedUser,
  onSelect,
  imageMap
}: Props) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [profileData, setProfileData] = useState<FullProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUserPopover, setOpenUserPopover] = useState<number | null>(null);

  const userId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const BACKEND_URL = 'http://localhost:8080';

  const fetchUserProfile = async () => {
    if (!userId) return;
    try {
      const res = await axios.get<FullProfile>(`/users/${userId}`);
      const data = res.data;
      setProfileData(data);
      if (data.hasProfileImage) {
        const ts = Date.now();
        setImageUrl(`${BACKEND_URL}/users/${userId}/profile-image?ts=${ts}`);
      } else {
        setImageUrl(null);
      }
      setRefreshKey(prev => prev + 1);
    } catch {
      alert('Failed to load profile');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const handleRawFileSelection = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setShowCropModal(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File) => {
    if (!userId) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/users/${userId}/profile-image`, formData);
      setShowCropModal(false);
      setShowImageModal(false);
      fetchUserProfile();
    } catch {
      alert('Failed to upload image');
    }
  };

  const handleImageDelete = async () => {
    if (!userId) return;
    try {
      await axios.delete(`/users/${userId}/profile-image`);
      setShowImageModal(false);
      fetchUserProfile();
    } catch {
      alert('Failed to delete image');
    }
  };

  const currentAvatarUrl = profileData
    ? imageUrl
    : currentUser && imageMap[currentUser.id];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-0 flex-col border-slate-200 bg-white p-4 md:border-r">
      <h1 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-slate-900">
        <MessageCircle aria-hidden="true" className="size-9 rounded-xl bg-emerald-100 p-2 text-emerald-800" />
        SwiftTalk
      </h1>
      {/* Current User Profile (editable) */}
      {currentUser && (
        <Popover
          open={openUserPopover === currentUser.id}
          onOpenChange={open => setOpenUserPopover(open ? currentUser.id : null)}
        >
          <PopoverTrigger asChild>
            <div
              onClick={() => setOpenUserPopover(currentUser.id)}
              className="flex items-center gap-3 mb-4 cursor-pointer p-2 rounded-lg hover:bg-gray-100"
            >
              <Avatar className="h-10 w-10 ring-2 ring-emerald-600 shadow">
                {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} alt="" />}
                <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{currentUser.username}</p>
                <p className="text-gray-400 text-xs">You</p>
              </div>
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="z-50 p-0 bg-transparent border-none shadow-none"
            align="start"
            side="right"
            sideOffset={8}
          >
            <div className="w-[min(350px,calc(100vw-24px))] bg-white rounded-xl shadow-xl">
              {profileData && (
                <ProfileDetails
                  key={refreshKey}
                  userId={profileData.id}
                  username={profileData.username}
                  email={profileData.email}
                  bio={profileData.bio}
                  imageUrl={imageUrl}
                  openImageModal={() => setShowImageModal(true)}
                  refreshProfile={fetchUserProfile}
                />
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Chat Search */}
      <h2 className="text-sm font-semibold text-gray-600 mb-2">Chats</h2>
      <Input
        type="text"
        placeholder="Search people"
        aria-label="Search people"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-3"
      />

      {/* Chat List */}
      <ScrollArea className="min-h-0 flex-1">
        {filteredUsers.length === 0 && <p className="px-2 py-3 text-sm text-slate-500">No people found.</p>}
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              selectedUser?.id === user.id ? 'bg-emerald-100' : 'hover:bg-gray-100'
            }`}
          >
            {/* Avatar (profile popover trigger) */}
            <Popover
              open={openUserPopover === user.id}
              onOpenChange={open => setOpenUserPopover(open ? user.id : null)}
            >
              <PopoverTrigger asChild>
                <div
                  onClick={e => {
                    e.stopPropagation(); // prevent triggering onSelect
                    setOpenUserPopover(user.id);
                  }}
                >
                  <Avatar>
                    {imageMap[user.id] ? (
                      <AvatarImage src={imageMap[user.id]} />
                    ) : (
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </PopoverTrigger>

              <PopoverContent
                className="z-50 p-0 bg-transparent border-none shadow-none"
                align="start"
                side="right"
                sideOffset={8}
              >
                <div className="w-[min(350px,calc(100vw-24px))] bg-white rounded-xl shadow-xl p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {user.username}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">{user.email || 'No email available'}</p>
                  <p className="text-sm text-gray-700">
                    {user.bio || 'No bio available'}
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <button type="button" onClick={() => onSelect(user)} aria-current={selectedUser?.id === user.id ? true : undefined}
              className="min-w-0 flex-1 cursor-pointer truncate py-2 text-left text-sm font-medium text-slate-800">
              {user.username}
            </button>
          </div>
        ))}
      </ScrollArea>

      {/* Image Modals */}
      <ProfileImageModal
        imageUrl={imageUrl}
        username={profileData?.username || ''}
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onUpload={handleRawFileSelection}
        onDelete={handleImageDelete}
      />
      <ImageCropModal
        imageSrc={selectedImage}
        open={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropComplete={handleImageUpload}
      />
    </div>
  );
}
