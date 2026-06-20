import { Suspense } from 'react';
import BoardClient from './BoardClient';

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">Loading Board...</h2>
      </div>
    }>
      <BoardClient />
    </Suspense>
  );
}

