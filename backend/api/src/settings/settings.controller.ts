import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import type { UserSettingsData } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(@User() user: any) {
    return this.settingsService.getUserSettings(user.id);
  }

  @Put()
  async updateSettings(
    @User() user: any,
    @Body() data: UserSettingsData
  ) {
    return this.settingsService.updateUserSettings(user.id, data);
  }

  @Put('profile')
  async updateProfile(
    @User() user: any,
    @Body() profileData: {
      name?: string;
      email?: string;
      company?: string;
    }
  ) {
    return this.settingsService.updateProfile(user.id, profileData);
  }

  @Post('change-password')
  async changePassword(
    @User() user: any,
    @Body() passwordData: {
      currentPassword: string;
      newPassword: string;
    }
  ) {
    return this.settingsService.changePassword(
      user.id,
      passwordData.currentPassword,
      passwordData.newPassword
    );
  }
}
