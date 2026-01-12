import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen items-center justify-center bg-viking-dark text-viking-gold">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-serif font-bold tracking-widest uppercase drop-shadow-md">
          {t('game.title')}
        </h1>
        <p className="text-stone-400 font-sans tracking-wide">
          v0.1.0 - Skeleton Build
        </p>
      </div>
    </div>
  )
}

export default App
