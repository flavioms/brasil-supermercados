'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Image from 'next/image';
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
  const [checkedExpanded, setCheckedExpanded] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    try {
      return !localStorage.getItem('swipe-hint-seen');
    } catch {
      return true;
    }
  });

  const dismissSwipeHint = () => {
    try {
      localStorage.setItem('swipe-hint-seen', '1');
    } catch {}
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
        <p className="text-title text-on-surface mb-4">ID da lista não informado</p>
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
        <p className="text-title text-on-surface mb-4">Lista não encontrada</p>
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

          <div className="flex-1 overflow-hidden">
            <h1 className="text-title text-on-surface truncate font-bold">{list.name}</h1>
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
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 text-6xl">🛒</div>
            <p className="text-title text-on-surface mb-1 font-bold">Liste o que precisa comprar</p>
            <p className="text-body text-on-surface-muted mb-5">
              Toque no <strong>+</strong> para adicionar cada item.
            </p>
            <div className="mb-5 flex items-center gap-2">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-caption text-on-surface-muted/60">na loja</span>
              <div className="h-px w-12 bg-gray-200" />
            </div>
            <p className="text-body text-on-surface-muted">
              Marque cada item ao colocá-lo no carrinho físico. O total atualiza na hora.
            </p>
          </div>
        ) : (
          <div>
            {showSwipeHint && uncheckedItems.length > 0 && (
              <div className="bg-primary/5 flex items-center gap-2 px-3 py-2.5 sm:hidden">
                {/* Excluir (swipe left) */}
                <div
                  className="text-danger flex w-20 items-center gap-1.5"
                  style={{ animation: 'swipe-glow-left 4s ease-in-out infinite' }}
                >
                  <Image
                    src="/arrow-left.png"
                    alt=""
                    aria-hidden="true"
                    width={18}
                    height={18}
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(18%) sepia(97%) saturate(800%) hue-rotate(350deg) brightness(85%)',
                    }}
                  />
                  <span className="text-caption font-semibold">Excluir</span>
                </div>

                {/* Animated hand icon — alternates between swipe-left and swipe-right */}
                <div
                  className="relative flex flex-1 items-center justify-center"
                  style={{ animation: 'swipe-demo 4s ease-in-out infinite' }}
                >
                  <Image
                    src="/swipe-hint.png"
                    alt="Deslize para interagir"
                    width={28}
                    height={28}
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(40%) sepia(5%) saturate(300%) hue-rotate(200deg) brightness(95%)',
                      animation: 'swipe-icon-left 4s ease-in-out infinite',
                    }}
                  />
                  <Image
                    src="/swipe-right.png"
                    alt=""
                    aria-hidden="true"
                    width={28}
                    height={28}
                    className="absolute"
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(40%) sepia(5%) saturate(300%) hue-rotate(200deg) brightness(95%)',
                      animation: 'swipe-icon-right 4s ease-in-out infinite',
                    }}
                  />
                </div>

                {/* No carrinho (swipe right) */}
                <div
                  className="text-primary flex w-20 items-center justify-end gap-1.5"
                  style={{ animation: 'swipe-glow-right 4s ease-in-out infinite' }}
                >
                  <span className="text-caption font-semibold">No carrinho</span>
                  <Image
                    src="/arrow-right.png"
                    alt=""
                    aria-hidden="true"
                    width={18}
                    height={18}
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(28%) sepia(58%) saturate(800%) hue-rotate(100deg) brightness(70%)',
                    }}
                  />
                </div>

                {/* Dismiss */}
                <button
                  onClick={dismissSwipeHint}
                  aria-label="Dispensar dica"
                  className="text-on-surface-muted/60 ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="divide-y divide-gray-100">
              {uncheckedItems.map((item) => (
                <ItemRow key={item.id} item={item} onEditRequest={handleEditRequest} />
              ))}
            </div>

            {checkedItems.length > 0 && (
              <div>
                <button
                  onClick={() => setCheckedExpanded((prev) => !prev)}
                  className="text-caption text-on-surface-muted flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 font-medium"
                >
                  <span>No carrinho ({checkedItems.length})</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${checkedExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
        className="bg-primary absolute right-4 bottom-[calc(160px+16px)] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg active:scale-95"
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
