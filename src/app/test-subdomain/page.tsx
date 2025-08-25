export default function TestSubdomainPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Subdomain Test Page</h1>
      <p>If you can see this page, the subdomain routing is working!</p>
      <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
      <p>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'Server-side'}</p>
    </div>
  );
}
