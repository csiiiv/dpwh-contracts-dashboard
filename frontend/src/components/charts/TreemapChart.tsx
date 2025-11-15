import React, { useRef, useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeColors } from '../../design-system/theme'
import { spacing, typography } from '../../design-system'

// Types
export interface TreemapData {
  level: 'grouping' | 'sub-grouping' | 'contracts'
  entities: Array<{
    id: string
    name: string
    value: number
    count: number
    // For contracts level:
    contractDetails?: {
      amount: number
      date: string
      description: string
      contractor: string
    }
  }>
}

export interface TreemapChartProps {
  data: TreemapData
  hierarchy: string[]
  currentLevel: number
  onDrillDown: (entity: { id: string; name: string; type: string }) => void
  onDrillUp: () => void
  onContractClick?: (contract: any) => void
  title?: string
  height?: number
  className?: string
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  hierarchy,
  currentLevel,
  onDrillDown,
  onDrillUp,
  onContractClick,
  title = 'Treemap Visualization',
  height = 400,
  className = ''
}) => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredItem, setHoveredItem] = useState<{ x: number; y: number; text: string } | null>(null)

  // Calculate treemap layout using proper squarified algorithm
  const calculateTreemapLayout = (items: TreemapData['entities'], width: number, height: number) => {
    if (items.length === 0) return []

    // Sort by value descending
    const sortedItems = [...items].sort((a, b) => b.value - a.value)
    const totalValue = sortedItems.reduce((sum, item) => sum + item.value, 0)

    const padding = 2
    const minRectSize = 40 // Minimum rectangle size for readability

    // Squarified treemap algorithm
    const squarify = (children: typeof sortedItems, x: number, y: number, width: number, height: number) => {
      if (children.length === 0) return []
      if (children.length === 1) {
        return [{
          x: x + padding,
          y: y + padding,
          width: Math.max(width - 2 * padding, minRectSize),
          height: Math.max(height - 2 * padding, minRectSize),
          data: children[0]
        }]
      }

      const rectangles: Array<{
        x: number
        y: number
        width: number
        height: number
        data: typeof items[0]
      }> = []

      const isHorizontal = width >= height
      const totalArea = width * height
      
      let currentRow: typeof children = []
      let currentRowSum = 0
      let currentRowArea = 0
      let currentY = y
      let currentX = x

      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childArea = (child.value / totalValue) * totalArea
        // const childLength = isHorizontal ? childArea / height : childArea / width

        // Check if adding this child would improve the aspect ratio
        const newRowSum = currentRowSum + child.value
        const newRowArea = currentRowArea + childArea
        const newRowLength = isHorizontal ? newRowArea / height : newRowArea / width
        const newRowAspectRatio = isHorizontal ? 
          Math.max(newRowLength / height, height / newRowLength) :
          Math.max(newRowLength / width, width / newRowLength)

        const currentRowAspectRatio = currentRow.length === 0 ? Infinity :
          isHorizontal ?
            Math.max(currentRowArea / (height * height), (height * height) / currentRowArea) :
            Math.max(currentRowArea / (width * width), (width * width) / currentRowArea)

        if (currentRow.length === 0 || newRowAspectRatio <= currentRowAspectRatio) {
          // Add to current row
          currentRow.push(child)
          currentRowSum = newRowSum
          currentRowArea = newRowArea
        } else {
          // Finish current row and start new one
          const rowLength = isHorizontal ? currentRowArea / height : currentRowArea / width
          
          currentRow.forEach((item, index) => {
            const itemArea = (item.value / totalValue) * totalArea
            const itemLength = isHorizontal ? itemArea / height : itemArea / width
            
            rectangles.push({
              x: currentX + (isHorizontal ? 0 : index * itemLength),
              y: currentY + (isHorizontal ? index * itemLength : 0),
              width: isHorizontal ? rowLength : itemLength,
              height: isHorizontal ? itemLength : rowLength,
              data: item
            })
          })

          // Start new row
          if (isHorizontal) {
            currentX += rowLength
          } else {
            currentY += rowLength
          }
          
          currentRow = [child]
          currentRowSum = child.value
          currentRowArea = childArea
        }
      }

      // Process remaining items in the last row
      if (currentRow.length > 0) {
        const rowLength = isHorizontal ? currentRowArea / height : currentRowArea / width
        
        currentRow.forEach((item, index) => {
          const itemArea = (item.value / totalValue) * totalArea
          const itemLength = isHorizontal ? itemArea / height : itemArea / width
          
          rectangles.push({
            x: currentX + (isHorizontal ? 0 : index * itemLength),
            y: currentY + (isHorizontal ? index * itemLength : 0),
            width: isHorizontal ? rowLength : itemLength,
            height: isHorizontal ? itemLength : rowLength,
            data: item
          })
        })
      }

      return rectangles
    }

    return squarify(sortedItems, 0, 0, width, height)
  }

  // Render treemap
  useEffect(() => {
    if (!svgRef.current || !data.entities.length) return

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Clear previous content
    svg.innerHTML = ''

    const rectangles = calculateTreemapLayout(data.entities, width, height)

    rectangles.forEach((rect, index) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      
      const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectElement.setAttribute('x', rect.x.toString())
      rectElement.setAttribute('y', rect.y.toString())
      rectElement.setAttribute('width', rect.width.toString())
      rectElement.setAttribute('height', rect.height.toString())
      rectElement.setAttribute('fill', getColorForIndex(index, isDark))
      rectElement.setAttribute('stroke', themeColors.border.medium)
      rectElement.setAttribute('stroke-width', '1')
      rectElement.setAttribute('rx', '4')
      rectElement.setAttribute('ry', '4')
      rectElement.style.cursor = 'pointer'
      rectElement.style.transition = 'all 0.2s ease'

      // Hover effects
      rectElement.addEventListener('mouseenter', (e) => {
        const target = e.currentTarget as SVGRectElement
        const rect = target.getBoundingClientRect()
        setHoveredItem({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          text: `${rect.data.name}: ${formatValue(rect.data.value)}`
        })
        rectElement.setAttribute('fill', getColorForIndex(index, isDark, true))
        rectElement.setAttribute('stroke-width', '2')
      })

      rectElement.addEventListener('mouseleave', () => {
        setHoveredItem(null)
        rectElement.setAttribute('fill', getColorForIndex(index, isDark))
        rectElement.setAttribute('stroke-width', '1')
      })

      // Click handler
      rectElement.addEventListener('click', () => {
        if (data.level === 'contracts' && onContractClick) {
          onContractClick(rect.data)
        } else {
          onDrillDown({
            id: rect.data.id,
            name: rect.data.name,
            type: hierarchy[currentLevel] || 'unknown'
          })
        }
      })

      // Only add text if rectangle is large enough
      if (rect.width > 50 && rect.height > 30) {
        // Add text label with better sizing and positioning
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', (rect.x + rect.width / 2).toString())
        text.setAttribute('y', (rect.y + rect.height / 2 - 6).toString())
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('fill', themeColors.text.inverse)
        
        // Better font sizing based on rectangle size
        const fontSize = Math.max(8, Math.min(14, Math.min(rect.width, rect.height) / 8))
        text.setAttribute('font-size', fontSize + 'px')
        text.setAttribute('font-weight', '600')
        text.style.pointerEvents = 'none'
        text.style.userSelect = 'none'

        // Truncate text more intelligently
        const maxLength = Math.floor(rect.width / (fontSize * 0.5))
        const displayText = rect.data.name.length > maxLength 
          ? rect.data.name.substring(0, maxLength) + '...'
          : rect.data.name

        text.textContent = displayText
        group.appendChild(text)

        // Add value label if there's enough space
        if (rect.height > 40) {
          const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          valueText.setAttribute('x', (rect.x + rect.width / 2).toString())
          valueText.setAttribute('y', (rect.y + rect.height / 2 + 10).toString())
          valueText.setAttribute('text-anchor', 'middle')
          valueText.setAttribute('dominant-baseline', 'middle')
          valueText.setAttribute('fill', themeColors.text.inverse)
          
          const valueFontSize = Math.max(6, Math.min(10, fontSize * 0.7))
          valueText.setAttribute('font-size', valueFontSize + 'px')
          valueText.setAttribute('font-weight', '400')
          valueText.style.pointerEvents = 'none'
          valueText.style.userSelect = 'none'

          const formattedValue = formatValue(rect.data.value)
          valueText.textContent = formattedValue
          group.appendChild(valueText)
        }
      } else {
        // For very small rectangles, just show a tooltip on hover
        rectElement.setAttribute('data-tooltip', `${rect.data.name}: ${formatValue(rect.data.value)}`)
      }

      group.appendChild(rectElement)
      svg.appendChild(group)
    })
  }, [data, isDark, themeColors, hierarchy, currentLevel, onDrillDown, onContractClick])

  // Color generation
  const getColorForIndex = (index: number, isDark: boolean, hovered = false) => {
    const colors = isDark 
      ? [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ]
      : [
          '#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED',
          '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
        ]
    
    const baseColor = colors[index % colors.length]
    return hovered ? lightenColor(baseColor, 20) : baseColor
  }

  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  const formatValue = (value: number) => {
    if (value >= 1e9) return `₱${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `₱${(value / 1e3).toFixed(1)}K`
    return `₱${value.toFixed(0)}`
  }

  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
        padding: `0 ${spacing[2]}`
      }}>
        <h3 style={{
          ...typography.textStyles.h3,
          color: themeColors.text.primary,
          margin: 0
        }}>
          {title}
        </h3>
        
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          fontSize: typography.fontSize.sm,
          color: themeColors.text.secondary
        }}>
          {hierarchy.slice(0, currentLevel + 1).map((level, index) => (
            <React.Fragment key={index}>
              <span style={{
                textTransform: 'capitalize',
                fontWeight: index === currentLevel ? typography.fontWeight.semibold : typography.fontWeight.normal
              }}>
                {level}
              </span>
              {index < currentLevel && <span>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {currentLevel > 0 && (
        <div style={{
          marginBottom: spacing[4],
          display: 'flex',
          gap: spacing[2]
        }}>
          <button
            onClick={onDrillUp}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: themeColors.primary[600],
              color: themeColors.text.inverse,
              border: 'none',
              borderRadius: spacing[1],
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.primary[700]
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.primary[600]
            }}
          >
            ← Back to {hierarchy[currentLevel - 1]}
          </button>
        </div>
      )}

      {/* Treemap SVG */}
      <div style={{
        width: '100%',
        height: height,
        backgroundColor: themeColors.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${themeColors.border.medium}`,
        overflow: 'hidden'
      }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        />
      </div>

      {/* Legend/Info */}
      <div style={{
        marginTop: spacing[4],
        padding: spacing[3],
        backgroundColor: themeColors.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${themeColors.border.medium}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: typography.fontSize.sm,
          color: themeColors.text.secondary
        }}>
          <span>
            {data.entities.length} {hierarchy[currentLevel] || 'items'} • 
            Total: {formatValue(data.entities.reduce((sum, item) => sum + item.value, 0))}
          </span>
          <span>
            {data.level === 'contracts' ? 'Click items to view details' : 'Click items to drill down'}
          </span>
        </div>
      </div>

      {/* Tooltip for small rectangles */}
      {hoveredItem && (
        <div
          style={{
            position: 'fixed',
            left: hoveredItem.x,
            top: hoveredItem.y,
            transform: 'translateX(-50%)',
            backgroundColor: themeColors.background.primary,
            color: themeColors.text.primary,
            padding: `${spacing[2]} ${spacing[3]}`,
            borderRadius: spacing[1],
            border: `1px solid ${themeColors.border.medium}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {hoveredItem.text}
        </div>
      )}
    </div>
  )
}
