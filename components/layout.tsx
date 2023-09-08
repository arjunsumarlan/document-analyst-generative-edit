interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex flex-col space-y-4">
      <header className="w-screen sticky top-0 z-40 bg-white">
        <div className="h-16 border-b flex flex-row border-b-slate-200 py-4">
          <nav className="ml-4 md:ml-4 md:pl-6">
            <a href="/">
              <img src="/logo-with-text.png" alt="logo" className="cursor-pointer w-32" />
            </a>
          </nav>
          <nav className="ml-2 pt-1 md:ml-4 md:pl-6">
            <a href="/analyst" className="hover:text-slate-600 text-sm md:text-base cursor-pointer">
              Analyst
            </a>
          </nav>
          <nav className="ml-2 pt-1 md:ml-4 md:pl-6">
            <a href="/generator" className="hover:text-slate-600 text-sm md:text-base cursor-pointer">
              Generator
            </a>
          </nav>
          <nav className="ml-2 pt-1 md:ml-4 md:pl-6">
            <a href="/comparator" className="hover:text-slate-600 text-sm md:text-base cursor-pointer">
              Comparator
            </a>
          </nav>
          <nav className="ml-2 pt-1 md:ml-4 md:pl-6">
            <a href="/advisor" className="hover:text-slate-600 text-sm md:text-base cursor-pointer">
              Advisor
            </a>
          </nav>
          <div className="absolute top-0 right-0 p-3">
            <a href="https://wa.me/6281911125599" target="blank" className="bg-[#B61516] text-white px-4 py-2 rounded-full hover:bg-[#b61515c2] transition duration-300 ease-in-out hover:text-sm">
              Call Our Expert
            </a>
          </div>
        </div>
      </header>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
