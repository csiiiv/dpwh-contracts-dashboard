import React from 'react'
import { LogoImg, TextWrapper } from '@/components/styled/App.styled'
import { ThemeToggle } from '@/components/features/shared/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeVars } from '@/design-system/theme'

const Header: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'Open DPWH by BetterGov.ph',
  subtitle = 'DPWH Contracts Data Explorer',
}) => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)

  return (
    <header className="w-full border-b bg-white dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Logo with circular white background so it shows on dark themes */}
          <div className="rounded-full bg-white flex items-center justify-center overflow-hidden border-0 border-gray" style={{ width: 128, height: 128 }}>
            <img src="/BetterGov_Icon-Primary.svg" alt="BetterGov logo" style={{ width: 128, height: 128 }} />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{title}</h1>
            <h2 className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</h2>
          </div>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
