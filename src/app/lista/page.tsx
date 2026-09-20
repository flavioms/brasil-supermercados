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
            <div className="divide-y divide-gray-100">
              {uncheckedItems.map((item) => (
                <ItemRow key={item.id} item={item} onEditRequest={handleEditRequest} />
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
                      <ItemRow key={item.id} item={item} onEditRequest={handleEditRequest} />
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
