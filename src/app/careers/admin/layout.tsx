/**
 * Admin section shell. Authorization is enforced per-page (each protected page
 * calls getAdminEmail and redirects to /careers/admin/login when not allowed),
 * because the login page lives under this same layout and a layout-level guard
 * would cause a redirect loop.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
