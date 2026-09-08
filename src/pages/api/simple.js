export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Simple API route',
    timestamp: new Date().toISOString(),
    status: 'ok'
  })
}
