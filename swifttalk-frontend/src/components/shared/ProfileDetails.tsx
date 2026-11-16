'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from '@/lib/axios';

interface ProfileDetailsProps {
  openImageModal: () => void;
  userId: string;
  username: string;
  bio: string;
  email: string;
  imageUrl: string | null;
  refreshProfile: () => void;
}

export default function ProfileDetails({
  openImageModal,
  userId,
  username,
  bio,
  email,
  imageUrl,
  refreshProfile,
}: ProfileDetailsProps) {
  const [editUsername, setEditUsername] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempBio, setTempBio] = useState(bio);
  const router = useRouter();

  const updateUsername = async () => {
    try {
      await axios.put(`/users/${userId}/username`, { username: tempUsername });
      setEditUsername(false);
      refreshProfile();
    } catch {
      alert('Failed to update username');
    }
  };

  const updateBio = async () => {
    try {
      await axios.put(`/users/${userId}/bio`, { bio: tempBio });
      setEditBio(false);
      refreshProfile();
    } catch {
      alert('Failed to update bio');
    }
  };

  const handleLogout = () => {
    for (const key of ['token', 'userId', 'username', 'role']) localStorage.removeItem(key);
    router.replace('/login');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <div className="flex flex-col items-center gap-3">
        {/* Profile Image */}
        <div className="cursor-pointer" onClick={openImageModal}>
          <Avatar className="h-28 w-28 ring-2 ring-blue-500 shadow-md">
            {imageUrl && imageUrl.trim() !== '' ? (
              <AvatarImage src={imageUrl} />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-500 text-3xl font-bold">
                {username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Username */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Username</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditUsername(!editUsername)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          {editUsername ? (
            <div className="flex gap-2 items-center">
              <Input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
              />
              <Button size="sm" onClick={updateUsername}>
                Save
              </Button>
            </div>
          ) : (
            <h2 className="text-xl font-semibold">@{username}</h2>
          )}
        </div>

        {/* Bio */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">About</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditBio(!editBio)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          {editBio ? (
            <div className="flex gap-2">
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={3}
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
              />
              <Button size="sm" className="h-fit mt-1" onClick={updateBio}>
                Save
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {bio || 'No bio set.'}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="w-full">
          <p className="text-sm font-medium text-gray-600">Email</p>
          <p className="text-sm text-gray-800 mt-1">{email}</p>
        </div>

        {/* Logout */}
        <div className="w-full border-t pt-4 mt-4 space-y-2">
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleLogout}
          >
            Log out
          </Button>
          <p className="text-xs text-center text-gray-500">
            You can sign in again to view your conversations.
          </p>
        </div>
      </div>
    </div>
  );
}
