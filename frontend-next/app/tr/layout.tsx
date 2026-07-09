import { LanguageProvider } from '@/context/LanguageContext'

export default function TrLayout({ children }: { children: React.ReactNode }) {
  return <LanguageProvider initialLang="tr">{children}</LanguageProvider>
}
