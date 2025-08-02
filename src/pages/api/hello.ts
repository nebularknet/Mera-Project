import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
  timestamp: string
  status: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ 
    message: 'Hello from traditional Next.js API route',
    timestamp: new Date().toISOString(),
    status: 'ok'
  })
} 