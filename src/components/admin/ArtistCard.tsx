import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Music, Trash2, Edit2 } from "lucide-react";

export interface ArtistProfileData {
  id: string;
  user_id: string;
  full_name?: string | null;
  artist_name?: string | null;
  email?: string | null;
  genre?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
  created_at?: string;
}

interface ArtistCardProps {
  artist: ArtistProfileData;
  onSelect: (artist: ArtistProfileData) => void;
  onDelete: (artist: ArtistProfileData) => void;
  onViewDashboard?: (artist: ArtistProfileData) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onSelect,
  onDelete,
  onViewDashboard,
}) => {
  const displayName = artist.artist_name || artist.full_name || artist.email || "Artist";

  return (
    <Card 
      className="p-6 border-0 shadow-soft hover:shadow-md transition-smooth cursor-pointer flex flex-col justify-between"
      onClick={() => onSelect(artist)}
    >
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center flex-shrink-0">
            {artist.avatar_url ? (
              <img
                src={artist.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-accent" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg truncate">{displayName}</h3>
            {artist.genre && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Music className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{artist.genre}</span>
              </p>
            )}
          </div>
        </div>

        {artist.email && (
          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2 truncate">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{artist.email}</span>
          </p>
        )}

        {artist.phone_number && (
          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4 truncate">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{artist.phone_number}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-border/50 justify-end" onClick={(e) => e.stopPropagation()}>
        {onViewDashboard && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDashboard(artist)}
          >
            Dashboard
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(artist)}
          title="Delete Artist"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
