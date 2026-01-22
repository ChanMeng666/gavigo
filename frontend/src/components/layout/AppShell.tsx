import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-base bg-grid-pattern overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

interface AppShellMainProps {
  children: React.ReactNode
  className?: string
}

export function AppShellMain({ children, className }: AppShellMainProps) {
  return (
    <main className={cn("flex-1 overflow-hidden", className)}>
      {children}
    </main>
  )
}
