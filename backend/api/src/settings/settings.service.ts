import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface UserSettingsData {
  // Financial Settings
  safetyBuffer?: number;
  defaultCurrency?: string;
  
  // Notification Settings
  emailSummary?: boolean;
  urgentDeadlineAlerts?: boolean;
  rateChangeAlerts?: boolean;
  
  // Security Settings
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
  
  // Organization Settings
  organizationName?: string;
  organizationDomain?: string;
  organizationSize?: string;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          // All defaults are handled by the schema
        }
      });
    }

    return settings;
  }

  async updateUserSettings(userId: string, data: UserSettingsData) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...data,
      }
    });
  }

  async updateProfile(userId: string, profileData: {
    name?: string;
    email?: string;
    company?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...profileData,
        updatedAt: new Date(),
      }
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // This would need proper password hashing and verification
    // For now, just a placeholder
    throw new Error('Password change not implemented yet');
  }
}
