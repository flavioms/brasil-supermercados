'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useListItems } from '@/hooks/useListItems';
import { useListTotal } from '@/hooks/useListTotal';
import { ItemRow } from '@/components/molecules/ItemRow';
import { ItemFormSheet } from '@/components/organisms/ItemFormSheet';
import { StickyTotalFooter } from '@/components/organisms/StickyTotalFooter';
import { BudgetProgressBar } from '@/components/atoms/ProgressBar';

function ListDetailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const listId = params.get('id') ?? '';

  const list = useShoppingList(listId);
  const items = useListItems(listId);
  const { totalCost, checkedTotal, budgetGoal } = useListTotal(listId);

  const [formOpen, setFormOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
  const [checkedExpanded, setCheckedExpanded] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    try { return !localStorage.getItem('swipe-hint-seen'); } catch { return true; }
  });

  const dismissSwipeHint = () => {
    try { localStorage.setItem('swipe-hint-seen', '1'); } catch {}
    setShowSwipeHint(false);
  };

  const uncheckedItems = items.filter((i) => !i.isChecked);
  const checkedItems = items.filter((i) => i.isChecked);

  const handleEditRequest = (itemId: string) => {
    setEditItemId(itemId);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditItemId(undefined);
    setFormOpen(true);
  };

  if (!listId) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-4 text-center">
        <p className="mb-4 text-title text-on-surface">ID da lista não informado</p>
        <button onClick={() => router.push('/')} className="text-primary underline">
          Voltar para o início
        </button>
      </div>
    );
  }

  if (list === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-body text-on-surface-muted">Carregando...</p>
      </div>
    );
  }

  if (list === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-4 text-center">
        <p className="mb-4 text-title text-on-surface">Lista não encontrada</p>
        <button onClick={() => router.push('/')} className="text-primary underline">
          Voltar para o início
        </button>
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col pb-[160px]">
      {/* AppBar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            aria-label="Voltar"
            className="flex h-[var(--spacing-touch)] w-[var(--spacing-touch)] items-center justify-center"
          >
            <svg className="h-6 w-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 overflow-hidden">
            <h1 className="truncate text-title font-bold text-on-surface">{list.name}</h1>
            <p className="text-caption text-on-surface-muted">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {budgetGoal !== null && (
          <div className="mt-2">
            <BudgetProgressBar current={checkedTotal} goal={budgetGoal} />
          </div>
        )}
      </header>

      {/* Items */}
      <div className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl">📝</div>
            <p className="mb-2 text-title font-medium text-on-surface">Lista vazia</p>
            <p className="text-body text-on-surface-muted">Toque no + para adicionar itens</p>
          </div>
        ) : (
          <div>
            {showSwipeHint && uncheckedItems.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-2">
                {/* Excluir (swipe left) */}
                <div className="flex items-center gap-1 text-danger">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] font-medium">Excluir</span>
                </div>

                {/* Dashed arrow with hand */}
                <div className="flex flex-1 items-center justify-center gap-0.5 text-on-surface-muted">
                  <span className="text-[11px]">←</span>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="h-px w-1.5 bg-on-surface-muted/40" />
                  ))}
                  <svg className="h-3.5 w-3.5 text-on-surface-muted/60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11.5V6a1.5 1.5 0 013 0v3.5a1.5 1.5 0 013 0v1a1.5 1.5 0 013 0v4a6 6 0 01-6 6H9a6 6 0 01-6-6v-1a1.5 1.5 0 013 0V11.5a1.5 1.5 0 013 0z" />
                  </svg>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="h-px w-1.5 bg-on-surface-muted/40" />
                  ))}
                  <span className="text-[11px]">→</span>
                </div>

                {/* Marcar (swipe right) */}
                <div className="flex items-center gap-1 text-primary">
                  <span className="text-[11px] font-medium">Marcar</span>
                  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Dismiss */}
                <button
                  onClick={dismissSwipeHint}
                  aria-label="Dispensar dica"
                  className="ml-1 flex h-6 w-6 flex-shrink-0 items-center justify-center text-on-surface-muted/60"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <div className="divide-y divide-gray-100">
              {uncheckedItems.map((item) => (
                <ItemRow key={item.id} item={item} allItems={items} onEditRequest={handleEditRequest} />
              ))}
            </div>

            {checkedItems.length > 0 && (
              <div>
                <button
                  onClick={() => setCheckedExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-caption font-medium text-on-surface-muted"
                >
                  <span>No carrinho ({checkedItems.length})</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${checkedExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {checkedExpanded && (
                  <div className="divide-y divide-gray-100">
                    {checkedItems.map((item) => (
                      <ItemRow key={item.id} item={item} allItems={items} onEditRequest={handleEditRequest} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleAddNew}
        aria-label="Adicionar item"
        className="absolute bottom-[calc(160px+16px)] right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Footer */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[var(--size-app-max-w)] -translate-x-1/2">
        <StickyTotalFooter
          totalCost={totalCost}
          checkedTotal={checkedTotal}
          budgetGoal={budgetGoal}
        />
      </div>

      <ItemFormSheet
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        listId={listId}
        {...(editItemId !== undefined ? { itemId: editItemId } : {})}
      />
    </main>
  );
}

export default function ListaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <p className="text-body text-on-surface-muted">Carregando...</p>
        </div>
      }
    >
      <ListDetailContent />
    </Suspense>
  );
}
