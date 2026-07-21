export interface Artist {
  id: string;
  name: string;
  biography?: string;
  profileImage?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
  };
}
