'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { ShoppingListController } from '@/controllers/ShoppingListController';
import { ListCard } from '@/components/molecules/ListCard';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { formatBRL } from '@/utils/currency';

export default function HomePage() {
  const router = useRouter();
  const lists = useShoppingLists();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    try {
      const budgetGoal = newBudget ? parseFloat(newBudget) : null;
      const id = await ShoppingListController.createList(newName, budgetGoal);
      setSheetOpen(false);
      setNewName('');
      setNewBudget('');
      router.push(`/lista/?id=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar lista');
    }
  };

  return (
    <main className="flex min-h-dvh flex-col">
      {/* AppBar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-headline text-primary font-bold">Minhas Listas</h1>
          <a href="/configuracoes/" className="text-on-surface-muted" aria-label="Configurações">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl">🛒</div>
            <h2 className="text-title text-on-surface mb-2 font-semibold">Nenhuma lista ainda</h2>
            <p className="text-body text-on-surface-muted mb-6">
              Crie sua primeira lista de compras
            </p>
            <button
              onClick={() => setSheetOpen(true)}
              className="bg-primary text-body rounded-xl px-6 py-3 font-semibold text-white"
            >
              Criar primeira lista
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onClick={() => router.push(`/lista/?id=${list.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary bar */}
      {lists.length > 0 && (
        <div className="bg-surface text-caption text-on-surface-muted border-t border-gray-200 px-4 py-2 text-center">
          {lists.length} lista{lists.length !== 1 ? 's' : ''} ativa{lists.length !== 1 ? 's' : ''} •{' '}
          {formatBRL(lists.reduce((sum, l) => sum + l.totalCost, 0))} total
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Nova lista"
        className="bg-primary absolute right-4 bottom-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg active:scale-95"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* New list sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} label="Nova lista">
        <div className="px-4 pb-6">
          <h2 className="text-title text-on-surface mb-4 font-semibold">Nova lista</h2>

          <div className="space-y-3">
            <div>
              <label className="text-caption text-on-surface-muted mb-1 block">Nome da lista</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Atacadão, Carrefour…"
                autoFocus
                className="text-body focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-caption text-on-surface-muted mb-1 block">
                Meta de orçamento (opcional)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="R$ 0,00"
                className="text-body focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
              />
            </div>

            {error && <p className="text-caption text-danger">{error}</p>}
          </div>

          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="bg-primary text-body mt-4 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
          >
            Criar lista
          </button>
        </div>
      </BottomSheet>
    </main>
  );
}
