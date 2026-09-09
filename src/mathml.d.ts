import type { HTMLAttributes } from 'react'

type FormulaAttributes = HTMLAttributes<MathMLElement> & { display?: 'block' | 'inline' }

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: FormulaAttributes
      mrow: FormulaAttributes
      msubsup: FormulaAttributes
      msup: FormulaAttributes
      mfrac: FormulaAttributes
      mo: FormulaAttributes
      mi: FormulaAttributes
      mn: FormulaAttributes
    }
  }
}
