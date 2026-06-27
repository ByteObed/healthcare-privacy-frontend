import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuth"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Lock,
  EyeOff,
  ShieldQuestion,
  BarChart3,
} from "lucide-react"

const navItems = [
  { title: "Patients", url: "/dashboard/patients", icon: Users },
  { title: "Encryption", url: "/dashboard/encryption", icon: Lock },
  { title: "Anonymization", url: "/dashboard/anonymization", icon: EyeOff },
  { title: "Masking", url: "/dashboard/masking", icon: ShieldQuestion },
  {
    title: "Differential Privacy",
    url: "/dashboard/differential-privacy",
    icon: BarChart3,
  },
  { title: "Comparison", url: "/dashboard/comparison", icon: BarChart3 },
]

export function AppSidebar() {
  const { organisation, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <p className="px-2 py-1 font-semibold text-sm truncate">
          {organisation?.name ?? "Healthcare Privacy"}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Privacy Techniques</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}