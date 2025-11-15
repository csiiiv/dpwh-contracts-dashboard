import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeVars } from '../design-system/theme'
import { typography, spacing } from '../design-system'
import styled from 'styled-components'

const NotFoundContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${spacing[8]};
  text-align: center;
`

const NotFoundTitle = styled.h1<{ $isDark: boolean }>`
  ${typography.textStyles.h1}
  color: ${props => props.$isDark ? getThemeVars().text.primary : getThemeVars().text.primary};
  margin-bottom: ${spacing[4]};
`

const NotFoundText = styled.p<{ $isDark: boolean }>`
  ${typography.textStyles.body}
  color: ${props => props.$isDark ? getThemeVars().text.secondary : getThemeVars().text.secondary};
  margin-bottom: ${spacing[6]};
  max-width: 600px;
`

const HomeLink = styled(Link)<{ $isDark: boolean }>`
  ${typography.textStyles.body}
  color: ${getThemeVars().primary[600]};
  text-decoration: none;
  padding: ${spacing[3]} ${spacing[6]};
  border: 2px solid ${getThemeVars().primary[600]};
  border-radius: ${spacing[2]};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${getThemeVars().primary[600]};
    color: white;
  }
`

const NotFound: React.FC = () => {
  const { isDark } = useTheme()

  return (
    <NotFoundContainer $isDark={isDark}>
      <NotFoundTitle $isDark={isDark}>404 - Page Not Found</NotFoundTitle>
      <NotFoundText $isDark={isDark}>
        The page you are looking for does not exist. It may have been moved or deleted.
      </NotFoundText>
      <HomeLink to="/" $isDark={isDark}>
        Go to Home
      </HomeLink>
    </NotFoundContainer>
  )
}

export default NotFound
