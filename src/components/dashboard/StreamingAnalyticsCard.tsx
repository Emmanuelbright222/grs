import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Music } from "lucide-react";

interface StreamingAnalyticsProps {
  totalStreams: number;
  totalRevenue: number;
  activeTracksCount: number;
}

export const StreamingAnalyticsCard: React.FC<StreamingAnalyticsProps> = ({
  totalStreams,
  totalRevenue,
  activeTracksCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 border-0 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-full">
            <BarChart3 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Streams</p>
            <h3 className="text-2xl font-bold">{totalStreams.toLocaleString()}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Est. Earnings</p>
            <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <Music className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Tracks</p>
            <h3 className="text-2xl font-bold">{activeTracksCount}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};
