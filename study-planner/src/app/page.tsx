import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8f4] px-6 py-16 text-slate-900">
      <div aria-hidden="true" className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />

      <section className="relative w-full max-w-3xl rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-14">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl text-white" aria-hidden="true">
            ✓
          </div>
          <span className="text-lg font-semibold tracking-tight">Cap sur tes études</span>
        </div>

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Bonjour Oscar
        </p>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Ton espace pour avancer
        </p>
        <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Bienvenue dans ton plan de réussite.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
          Organise tes tâches, garde le cap sur tes objectifs et libère-toi l’esprit pour apprendre sereinement.
        </p>

        <Link
          href="/tasks"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-emerald-700 px-7 py-4 font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
        >
          Découvrir mes tâches <span aria-hidden="true">→</span>
        </Link>

        <div className="mt-14 flex items-center gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Un petit pas à la fois, et tu y arriveras.
        </div>
      </section>
    </main>
  );
}
