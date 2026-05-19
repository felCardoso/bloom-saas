"use client";

import { createContext, useContext, useState } from "react";

type ProfileContextType = {
  name: string;
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  name: "",
  avatarUrl: null,
  setAvatarUrl: () => {},
});

export function ProfileProvider({
  children,
  initialName,
  initialAvatarUrl,
}: {
  children: React.ReactNode;
  initialName: string;
  initialAvatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);

  return (
    <ProfileContext.Provider value={{ name: initialName, avatarUrl, setAvatarUrl }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
