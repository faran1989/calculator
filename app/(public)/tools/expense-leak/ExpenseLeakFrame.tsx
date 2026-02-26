'use client';

export default function ExpenseLeakFrame() {
  return (
    <iframe
      src="/tools/expense-leak.html"
      className="w-full border-0 rounded-3xl"
      style={{ height: '1500px' }}
      title="نشت‌یاب مالی"
      allow="clipboard-write"
    />
  );
}
