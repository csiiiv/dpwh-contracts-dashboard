import styled from 'styled-components'

interface StyledProps {
  $isDark: boolean
}

export const AppContainer = styled.div<StyledProps>`
  min-height: 100vh;
  background-color: var(--color-background-secondary);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--color-text-primary);
`

export const Header = styled.header<StyledProps>`
  background-color: var(--color-background-primary);
  border-bottom: 1px solid var(--color-border-light);
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const LogoImg = styled.img`
  width: 72px;
  height: 72px;
  object-fit: contain;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const Title = styled.h1<StyledProps>`
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
`

export const Subtitle = styled.h2<StyledProps>`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

export const Version = styled.div<StyledProps>`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`

export const Navigation = styled.nav<StyledProps>`
  background-color: var(--color-background-primary);
  border-bottom: 1px solid var(--color-border-light);
  padding: 0 1.5rem;
`

export const NavigationContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
`

export const TabButton = styled.button<StyledProps & { $isActive: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background-color: ${props => 
    props.$isActive 
      ? 'var(--color-primary-600)' 
      : 'transparent'
  };
  color: ${props => 
    props.$isActive 
      ? 'var(--color-text-inverse)' 
      : 'var(--color-text-primary)'
  };
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.25rem 0.25rem 0 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &:hover {
    background-color: ${props => 
      props.$isActive 
        ? 'var(--color-primary-600)'
        : 'var(--color-primary-50)'
    };
  }

  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &[aria-current="page"] {
    background-color: var(--color-primary-600);
    color: var(--color-text-inverse);
  }
`

export const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`

export const Footer = styled.footer<StyledProps>`
  background-color: var(--color-background-primary);
  border-top: 1px solid var(--color-border-light);
  padding: 1.5rem;
  margin-top: 3rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;

  p {
    margin: 0;
  }
`

export const TabIcon = styled.span`
  font-size: 1rem;
  line-height: 1;
`

export const TabLabel = styled.span`
  font-weight: inherit;
`
