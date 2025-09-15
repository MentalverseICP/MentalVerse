declare module 'react-jvectormap/core' {
  import { ComponentType } from 'react';

  export interface VectorMapProps {
    map?: string;
    backgroundColor?: string;
    zoomOnScroll?: boolean;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    regionStyle?: {
      initial?: {
        fill?: string;
        'fill-opacity'?: number;
        stroke?: string;
        'stroke-width'?: number;
        'stroke-opacity'?: number;
      };
      hover?: {
        'fill-opacity'?: number;
        cursor?: string;
      };
      selected?: {
        fill?: string;
      };
      selectedHover?: object;
    };
    series?: {
      regions?: Array<{
        values?: Record<string, number>;
        scale?: string[];
        normalizeFunction?: string;
      }>;
    };
    onRegionClick?: (event: unknown, code: string) => void;
    onRegionTipShow?: (event: unknown, el: unknown, code: string) => void;
  }

  export const VectorMap: ComponentType<VectorMapProps>;
}

declare module 'reactstrap' {
  import { ComponentType } from 'react';

  export interface CardProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface CardHeaderProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface CardBodyProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface RowProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface ColProps {
    className?: string;
    children?: React.ReactNode;
    md?: number;
    lg?: number;
    xl?: number;
  }

  export const Card: ComponentType<CardProps>;
  export const CardHeader: ComponentType<CardHeaderProps>;
  export const CardBody: ComponentType<CardBodyProps>;
  export const Row: ComponentType<RowProps>;
  export const Col: ComponentType<ColProps>;
}