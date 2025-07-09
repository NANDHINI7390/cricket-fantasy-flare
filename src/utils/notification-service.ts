import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  userId: string;
  type: "match_update" | "contest_result" | "player_performance" | "league_update" | "system";
  title: string;
  message: string;
  priority?: "low" | "medium" | "high";
  actionUrl?: string;
}

export const notificationService = {
  // Send notification to specific user
  async sendToUser(data: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority || 'medium',
          action_url: data.actionUrl
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  // Send notification to multiple users
  async sendToUsers(userIds: string[], data: Omit<NotificationData, 'userId'>): Promise<boolean> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        action_url: data.actionUrl
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return false;
    }
  },

  // Send notification when user joins contest
  async notifyContestJoined(userId: string, contestName: string): Promise<boolean> {
    return this.sendToUser({
      userId,
      type: 'contest_result',
      title: 'Contest Joined Successfully!',
      message: `You have successfully joined "${contestName}". Good luck!`,
      priority: 'medium'
    });
  },

  // Send notification when contest results are declared
  async notifyContestResult(userId: string, position: number, contestName: string, winnings?: number): Promise<boolean> {
    const isWinner = winnings && winnings > 0;
    return this.sendToUser({
      userId,
      type: 'contest_result',
      title: isWinner ? '🎉 Congratulations! You Won!' : 'Contest Results',
      message: isWinner 
        ? `You finished #${position} in "${contestName}" and won ₹${winnings}!`
        : `You finished #${position} in "${contestName}". Better luck next time!`,
      priority: isWinner ? 'high' : 'medium'
    });
  },

  // Send notification for match updates
  async notifyMatchUpdate(userIds: string[], matchName: string, updateMessage: string): Promise<boolean> {
    return this.sendToUsers(userIds, {
      type: 'match_update',
      title: `${matchName} Update`,
      message: updateMessage,
      priority: 'medium'
    });
  },

  // Send notification for player performance
  async notifyPlayerPerformance(userId: string, playerName: string, performance: string, points: number): Promise<boolean> {
    return this.sendToUser({
      userId,
      type: 'player_performance',
      title: 'Player Performance Update',
      message: `Your ${playerName} ${performance}! +${points} fantasy points earned.`,
      priority: 'low'
    });
  },

  // Send system notifications
  async sendSystemNotification(userIds: string[], title: string, message: string): Promise<boolean> {
    return this.sendToUsers(userIds, {
      type: 'system',
      title,
      message,
      priority: 'medium'
    });
  }
};