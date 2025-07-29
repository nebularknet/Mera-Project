import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    message: 'Test API route',
    method: req.method,
    timestamp: new Date().toISOString()
  })
} 