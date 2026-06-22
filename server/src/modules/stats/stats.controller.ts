import type { Request, Response } from 'express';
import * as service from './stats.service';

export async function getStatsHandler(req: Request, res: Response) {
  res.json(await service.getStats(req.user!));
}
