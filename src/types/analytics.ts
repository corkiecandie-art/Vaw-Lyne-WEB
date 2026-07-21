export interface Analytics {
  totalReleases: number;
  totalTourEvents: number;
  totalFanSubscribers: number;
  totalLinkClicks: number;
  totalStreams: number;
  recentActivity: Array<{
    id: string;
    type: 'click' | 'presave' | 'fan_join' | 'release_added' | 'tour_added';
    message: string;
    timestamp: string;
  }>;
}
