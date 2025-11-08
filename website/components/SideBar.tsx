"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useState } from "react"
import { Home, BarChart2, Compass, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { PrimaryColor } from "@/src/utils"

interface Route {
  path: string
  icon: React.ElementType
  label: string
}



export default function Sidebar() {

  const routes: Route[] = [
    {
      path: "/",
      icon: HomeIcon,
      label: "Home",
    },
    {
      path: "/collection/create",
      icon: LaunchIcon,
      label: "Launch",
    },
    {
      path: "/docs/creation-guide",
      icon: GuideIcon,
      label: "Guide",
    },
    {
      path: "/litepaper",
      icon: DocIcon,
      label: "Docs",
    },
  ]
  const pathname = usePathname()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  return (
    <div className="hidden sm:flex w-[80px] bg-[#171a1f] flex-col items-center border-r border-gray-800 fixed left-0 top-0 bottom-0 z-20">
      <div className="flex flex-col items-center mb-4">
        <div className="w-9 h-9 mt-8 mb-3 bg-[#3af73e]" />
        <div
          className="text-[#3af73e] text-[13px] font-semibold uppercase italic tracking-[0.25em]"
          style={{ fontFamily: 'serif', fontVariant: 'small-caps' as any }}
        >
          Beta
        </div>
      </div>

      <div className="flex flex-col gap-6 items-center mt-20">
        {routes.map((route) => {
          const isActive = pathname === route.path
          const isHovered = hoveredPath === route.path

          return (
            <div key={route.path} className="relative group">
              <Link
                href={route.path}
                className="block"
                onMouseEnter={() => setHoveredPath(route.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200",
                    isActive ? "bg-[#1e2a1e]" : isHovered ? "bg-[#232323]" : "bg-transparent",
                  )}
                >
                  <route.icon isActive={isActive} />
                </div>
              </Link>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#232323] rounded text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {route.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const HomeIcon = ({ isActive }: { icon: ReactNode; isActive: boolean }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill={isActive ? PrimaryColor : 'none'}
        fillOpacity={isActive ? 0.1 : 0}
      />
      <path 
        d="M9 22V12H15V22" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}
const LaunchIcon = ({ isActive }: { icon: ReactNode; isActive: boolean }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2L2 7L12 12L22 7L12 2Z" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill={isActive ? PrimaryColor : 'none'}
        fillOpacity={isActive ? 0.1 : 0}
      />
      <path 
        d="M2 17L12 22L22 17" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M2 12L12 17L22 12" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}
const GuideIcon = ({ isActive }: { icon: ReactNode; isActive: boolean }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M9 12L11 14L15 10" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill={isActive ? PrimaryColor : 'none'}
        fillOpacity={isActive ? 0.1 : 0}
      />
    </svg>
  )
}
const DocIcon = ({ isActive }: { icon: ReactNode; isActive: boolean }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill={isActive ? PrimaryColor : 'none'}
        fillOpacity={isActive ? 0.1 : 0}
      />
      <path 
        d="M14 2V8H20" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16 13H8" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16 17H8" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M10 9H8" 
        stroke={isActive ? PrimaryColor : '#9CA3AF'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}
