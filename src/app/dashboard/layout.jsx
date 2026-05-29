import { AuthProvider } from '@/context/auth-context';
import { RoleGate } from '@/components/layout/role-gate';
import { Sidebar } from '@/components/layout/sidebar';

export default function StudentLayout({ children }) {
  return (
    <AuthProvider>
      <RoleGate allowedRoles={['student']}>
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-4 p-4 lg:flex-row">
          <Sidebar role="student" />
          <main className="flex-1 space-y-4">{children}</main>
        </div>
      </RoleGate>
    </AuthProvider>
  );
}