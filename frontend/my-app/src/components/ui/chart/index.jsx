import React, { createContext, useContext } from "react";
import "./chart.css";

// Chart context for configuration
const ChartContext = createContext(null);

/**
 * @typedef {Object} ChartConfig
 * @property {Object} [key: string]
 * @property {string} label - Label for the data series
 * @property {string} color - CSS variable or color value
 */

/**
 * Container for chart with configuration context
 * @param {Object} props
 * @param {ChartConfig} props.config - Configuration for chart data series
 * @param {React.ReactNode} props.children - Chart components
 */
export function ChartContainer({ config, children }) {
  return (
    <ChartContext.Provider value={config}>
      <div className="chart-container">
        {children}
      </div>
    </ChartContext.Provider>
  );
}

/**
 * Tooltip component for charts
 */
export function ChartTooltip({ content, cursor = false, ...props }) {
  return content;
}

/**
 * Content component for chart tooltips
 */
export function ChartTooltipContent({ 
  active, 
  payload, 
  label, 
  hideLabel = false, 
  formatter,
  ...props 
}) {
  const config = useContext(ChartContext);
  
  if (!active || !payload?.length) return null;
  
  return (
    <div className="chart-tooltip">
      {!hideLabel && label && (
        <div className="chart-tooltip-label">{label}</div>
      )}
      <div className="chart-tooltip-items">
        {payload.map((item, index) => {
          const dataKey = item.dataKey;
          const itemConfig = config?.[dataKey];
          const color = itemConfig?.color || item.color;
          const value = formatter ? formatter(item.value, dataKey, item, index) : item.value;
          
          return (
            <div key={`tooltip-item-${index}`} className="chart-tooltip-item">
              <div 
                className="chart-tooltip-color" 
                style={{ backgroundColor: color }}
              />
              <div className="chart-tooltip-label">
                {itemConfig?.label || dataKey}:
              </div>
              <div className="chart-tooltip-value">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}