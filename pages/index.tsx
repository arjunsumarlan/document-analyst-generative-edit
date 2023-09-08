export default function Home() {
  const styleNavLink = 'text-white cursor-pointer flex m-1 justify-center items-center rounded-lg text-2xl w-40 h-12 bg-opacity-80';

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center py-4">
        <img src="/logo-with-text.png" alt="logo" className="w-3/4" />
        <div className="flex flex-col md:flex-row justify-center items-center py-4">
          <a href="/analyst" className={`${styleNavLink} bg-[#c66b6b] hover:bg-[#B61516] no-underline`}>
            Analyst
          </a>
          <a href="/generator" className={`${styleNavLink} bg-[#c66b6b] hover:bg-[#B61516] no-underline`}>
            Generator
          </a>
          <a href="/comparator" className={`${styleNavLink} bg-[#c66b6b] hover:bg-[#B61516] no-underline`}>
            Comparator
          </a>
          <a href="/advisor" className={`${styleNavLink} bg-[#c66b6b] hover:bg-[#B61516] no-underline`}>
            Advisor
          </a>
        </div>
      </div>
    </div>
  );
}
