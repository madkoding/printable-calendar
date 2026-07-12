import { useTranslation } from 'react-i18next'
import { Button } from '@/presentation/components/ui/Button'

export function PrintButton() {
  const { t } = useTranslation()

  function handlePrint() {
    window.print()
  }

  return (
    <Button onClick={handlePrint} className="w-full justify-center">
      {t('controls.print')}
    </Button>
  )
}
