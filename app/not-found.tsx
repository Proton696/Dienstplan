import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-white">Seite nicht gefunden</h1>
      <p className="text-gray-400">Die angeforderte Seite existiert nicht.</p>
      <Link
        href="/"
        className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
