import { useState } from 'react'
import { usePreferences } from '../../preferences/context'

export function FormulaPreview() {
  const { t } = usePreferences()
  const [example, setExample] = useState<'integral' | 'identity'>('integral')
  return (
    <div className="formula-preview">
      <div className="formula-tabs" role="group" aria-label={t('选择公式示例')}>
        <button type="button" aria-pressed={example === 'integral'} onClick={() => setExample('integral')}>
          {t('积分')}
        </button>
        <button type="button" aria-pressed={example === 'identity'} onClick={() => setExample('identity')}>
          {t('欧拉恒等式')}
        </button>
      </div>
      <div className="formula-result" key={example}>
        {example === 'integral' ? (
          <math display="block" aria-label={t('从零到一对 x 的平方积分等于三分之一')}>
            <mrow>
              <msubsup>
                <mo>∫</mo>
                <mn>0</mn>
                <mn>1</mn>
              </msubsup>
              <msup>
                <mi>x</mi>
                <mn>2</mn>
              </msup>
              <mi>d</mi>
              <mi>x</mi>
              <mo>=</mo>
              <mfrac>
                <mn>1</mn>
                <mn>3</mn>
              </mfrac>
            </mrow>
          </math>
        ) : (
          <math display="block" aria-label={t('e 的 i π 次方加一等于零')}>
            <mrow>
              <msup>
                <mi>e</mi>
                <mrow>
                  <mi>i</mi>
                  <mi>π</mi>
                </mrow>
              </msup>
              <mo>+</mo>
              <mn>1</mn>
              <mo>=</mo>
              <mn>0</mn>
            </mrow>
          </math>
        )}
      </div>
      <code>
        {example === 'integral' ? String.raw`\int_0^1 x^2\,dx = \frac{1}{3}` : String.raw`e^{i\pi} + 1 = 0`}
      </code>
    </div>
  )
}
