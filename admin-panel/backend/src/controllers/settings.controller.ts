import { Request, Response } from 'express';
import { Setting } from '../models/Setting';
import { handleImageUpload } from '../middleware/upload';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create default settings row if empty
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSettings = async (req: any, res: Response) => {
  try {
    let logoUrl = '';
    let faviconUrl = '';

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        logoUrl = await handleImageUpload(req.files.logo[0]);
      }
      if (req.files.favicon && req.files.favicon[0]) {
        faviconUrl = await handleImageUpload(req.files.favicon[0]);
      }
    }

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    
    if (logoUrl) data.logo = logoUrl;
    if (faviconUrl) data.favicon = faviconUrl;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(data);
    } else {
      Object.assign(settings, data);
    }

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
