'use client';

import { useRouter } from 'next/navigation';
import { db } from '@/models/db';

const APP_VERSION = '0.0.1';

export default function ConfiguracoesPage() {
  const router = useRouter();

  const handleDeleteAllData = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.'
    );
    if (!confirmed) return;

    await db.shoppingLists.clear();
    await db.listItems.clear();
    await db.categories.clear();
    router.push('/');
  };

  return (
    <main className="bg-surface min-h-dvh">
      {/* AppBar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            aria-label="Voltar"
            className="flex h-[var(--spacing-touch)] w-[var(--spacing-touch)] items-center justify-center"
          >
            <svg
              className="text-on-surface h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-title text-on-surface font-bold">Configurações</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* App info */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white">
          <div className="px-4 py-3">
            <h2 className="text-caption text-on-surface-muted mb-3 font-semibold tracking-wide uppercase">
              Sobre o app
            </h2>
            <div className="flex items-center justify-between py-2">
              <span className="text-body text-on-surface">Versão</span>
              <span className="text-body text-on-surface-muted">{APP_VERSION}</span>
            </div>
          </div>
        </section>

        {/* Data management */}
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="px-4 py-3">
            <h2 className="text-caption text-on-surface-muted mb-3 font-semibold tracking-wide uppercase">
              Dados
            </h2>
            <button
              onClick={handleDeleteAllData}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <div>
                <div className="text-body text-danger font-medium">Apagar todos os dados</div>
                <div className="text-caption text-on-surface-muted">
                  Remove todas as listas e itens do dispositivo
                </div>
              </div>
              <svg
                className="text-danger h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </section>

        {/* LGPD notice */}
        <p className="text-caption text-on-surface-muted mt-6 text-center">
          Seus dados ficam apenas no seu dispositivo.{'\n'}Nenhuma informação é enviada para
          servidores.
        </p>
      </div>
    </main>
  );
}
