/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { JSX } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': {};
    }
  }
}
