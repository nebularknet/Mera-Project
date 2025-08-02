export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Vercel test endpoint',
    timestamp: new Date().toISOString(),
    status: 'ok'
  })
} 